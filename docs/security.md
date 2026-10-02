# Security Policy

## Supported Versions

HEED is currently in early-stage active development. Only the `main` branch is actively supported with security updates. Older releases are not currently maintained with backported security patches.

| Version | Supported          |
| ------- | ------------------ |
| `main`  | :white_check_mark: |
| `< 1.0` | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in HEED, please report it privately.

**Do not publicly disclose the vulnerability until it has been addressed.**

To report a vulnerability, please use [GitHub Security Advisories](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability) if available on this repository, or email the maintainers directly.

We will acknowledge receipt of your vulnerability report and strive to provide a timeline for a fix, but as an open-source project, we cannot guarantee specific response times. We do not currently offer a bug bounty program.

## Scope

HEED is a runtime security control layer for autonomous AI agents. The following types of issues are considered strictly in-scope security vulnerabilities:

* **Runtime Authorization Bypass:** Any mechanism allowing an agent to execute an action without a valid execution contract or policy.
* **Policy Bypass:** Bypassing configured "No-Go" patterns or strictly forbidden capabilities.
* **Provenance / IFC Bypass:** Sending data with restricted provenance labels to unauthorized destinations.
* **Approval Replay:** Reusing a consumed human approval binding for a new action.
* **Approval Mutation:** Modifying the arguments, destination, or provenance of an action after human approval is granted.
* **SSRF:** Server-Side Request Forgery bypasses in the network connectors (e.g., bypassing IPv4/IPv6/link-local/mapped protections).
* **Connector Escape:** Breaking out of the constrained connector sandbox.
* **Audit Integrity:** Tampering with or corrupting the cryptographic hash chain of the `EventStore`.
* **Fail-Open Behavior:** Any scenario where a failure in the database, policy engine, or execution context results in an `ALLOW` decision rather than `BLOCK` or `FAIL_CLOSED`.

## Out of Scope

The following are explicitly **out of scope** and are not considered vulnerabilities in HEED:

* **Prompt Injection (by itself):** HEED is designed to control *actions*, not natural language. If an agent receives a malicious prompt, HEED expects to evaluate the *resulting tool action*. Submitting a prompt injection payload that merely makes an agent say something malicious is out of scope.
* **Agent Hallucination:** Incorrect or suboptimal decisions made by the agent that do not violate explicitly defined HEED policies.
* **Compromised Underlying Infrastructure:** Root-level access to the HEED database or host servers.
* **Denial of Service (DoS):** Volumetric attacks against the HEED Control Plane or Runtime API.
* **Phishing / Social Engineering:** Attacks against human operators.

For more information on our threat model and security architecture, please review our [Security Documentation](./docs/security/README.md).
