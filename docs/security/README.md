# HEED Security Documentation

HEED is a runtime control layer designed to enforce boundaries on autonomous AI agents. 

This directory contains our honest, technical evaluation of HEED's security architecture, mapping our implemented controls to industry frameworks and documenting our adversarial testing results.

## Documentation Index

1. **[Threat Model](./threat-model.md)**: Details the system boundaries, trust relationships, assets, and potential adversarial scenarios HEED mitigates.
2. **[Framework Mapping](./framework-mapping.md)**: Maps HEED's architecture to principles from OWASP Agentic AI, OWASP LLM Top 10, MITRE ATLAS, and the NIST AI RMF.
3. **[Security Evaluation](./security-evaluation.md)**: The results of our adversarial testing suite, identifying exactly which controls are successfully implemented and transparently documenting known gaps.

## Related Resources

* **[Vulnerability Reporting Policy](../../SECURITY.md)**: Information on how to safely report security vulnerabilities to the HEED maintainers.
* **[Security Tests](../../tests/security/framework-evaluation.test.ts)**: The source code for the executable evaluation suite.
