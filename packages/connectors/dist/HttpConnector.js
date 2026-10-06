"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpConnector = void 0;
const url_1 = require("url");
const dns = __importStar(require("dns/promises"));
class HttpConnector {
    name = "http";
    capabilities = ["external_network.read", "external_network.write", "internal_api.read", "internal_api.write"];
    getOperationMetadata(operation, capability) {
        if (operation.includes("read") || operation.includes("get") || operation.includes("list") || operation.includes("search")) {
            return {
                reversibility: "REVERSIBLE",
                impactWeight: 1,
                dataSensitivity: "PUBLIC",
                trustEffect: "NONE",
                compensationAvailable: false
            };
        }
        if (operation.includes("write") || operation.includes("edit") || operation.includes("update") || operation.includes("commit")) {
            return {
                reversibility: "REVERSIBLE",
                impactWeight: 3,
                dataSensitivity: "INTERNAL",
                trustEffect: "NONE",
                compensationAvailable: true
            };
        }
        if (operation.includes("delete") || operation.includes("merge")) {
            return {
                reversibility: "IRREVERSIBLE",
                impactWeight: 10,
                dataSensitivity: "INTERNAL",
                trustEffect: "NONE",
                compensationAvailable: false
            };
        }
        if (operation.includes("deploy") || operation.includes("export")) {
            return {
                reversibility: "IRREVERSIBLE",
                impactWeight: 25,
                dataSensitivity: "RESTRICTED",
                trustEffect: "EXTERNAL_DESTINATION",
                compensationAvailable: false
            };
        }
        // Fallback
        return {
            reversibility: "UNKNOWN",
            impactWeight: 3,
            dataSensitivity: "INTERNAL",
            trustEffect: "NONE",
            compensationAvailable: false
        };
    }
    async compensate(action) {
        console.log(`[${this.name}] Compensating ${action.operation}`);
        return { status: "compensated", operation: action.operation };
    }
    async execute(action) {
        console.log(`[HttpConnector] Executing real API call for ${action.operation} on ${action.resource}`);
        try {
            const urlString = action.arguments.url;
            if (!urlString)
                throw new Error("Missing URL in HTTP request arguments");
            // SSRF Protection
            const url = new url_1.URL(urlString);
            if (url.protocol !== "http:" && url.protocol !== "https:") {
                throw new Error("Invalid protocol");
            }
            // Check against restricted subnets
            const isInternal = await this.isInternalIP(url.hostname);
            // If the destination isn't marked internal, but resolves to internal, it's SSRF
            // For now, let's hard-block known sensitive IP blocks unless explicitly authorized as internal capability
            if (isInternal && !action.capability?.startsWith("internal_api")) {
                throw new Error(`SSRF Prevention: Attempted to access internal network (${url.hostname}) using external network capability.`);
            }
            const method = action.arguments.method || "GET";
            const headers = action.arguments.headers || {};
            const body = action.arguments.body ? JSON.stringify(action.arguments.body) : undefined;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
            const response = await fetch(url.toString(), {
                method,
                headers,
                body,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const responseData = await response.text();
            let parsed;
            try {
                parsed = JSON.parse(responseData);
            }
            catch (e) {
                parsed = responseData.slice(0, 5000); // Prevent memory exhaustion
            }
            return {
                status: response.status,
                data: parsed
            };
        }
        catch (error) {
            throw new Error(`Http Connector Error: ${error.message}`);
        }
    }
    async isInternalIP(hostname) {
        // Fast path for IP strings
        if (this.isPrivateIP(hostname))
            return true;
        if (hostname.toLowerCase() === "localhost")
            return true;
        try {
            const lookup = await dns.lookup(hostname);
            return this.isPrivateIP(lookup.address);
        }
        catch {
            return false;
        }
    }
    isPrivateIP(ip) {
        if (ip === "::1")
            return true;
        if (ip.toLowerCase() === "::")
            return true;
        if (ip.toLowerCase().startsWith("fc") || ip.toLowerCase().startsWith("fd"))
            return true; // IPv6 ULA
        if (ip.toLowerCase().startsWith("fe8") || ip.toLowerCase().startsWith("fe9") || ip.toLowerCase().startsWith("fea") || ip.toLowerCase().startsWith("feb"))
            return true; // IPv6 Link-local
        // IPv4-mapped IPv6
        if (ip.toLowerCase().startsWith("::ffff:")) {
            ip = ip.substring(7);
        }
        const parts = ip.split(".");
        if (parts.length !== 4)
            return false;
        const [p1, p2] = parts.map(Number);
        if (p1 === 0)
            return true; // 0.0.0.0/8
        if (p1 === 10)
            return true; // 10.0.0.0/8
        if (p1 === 172 && p2 >= 16 && p2 <= 31)
            return true; // 172.16.0.0/12
        if (p1 === 192 && p2 === 168)
            return true; // 192.168.0.0/16
        if (p1 === 127)
            return true; // 127.0.0.0/8
        if (p1 === 169 && p2 === 254)
            return true; // 169.254.0.0/16 (Metadata)
        return false;
    }
}
exports.HttpConnector = HttpConnector;
