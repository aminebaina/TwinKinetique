# Legal, Medical & Regulatory Disclaimer / Avertissement Légal, Médical & Réglementaire

*Last updated / Dernière mise à jour : 2026-11-20*

---

## English Version

### 1. Research and Educational Use Only (Not a Medical Device)
**TwinKinétique** (including its TypeScript ODE engine, Web UI, JSON CLI, and Model Context Protocol [MCP] server) is a theoretical *in silico* Quantitative Systems Pharmacology (QSP) simulation software created strictly for **academic research, computational modeling demonstrations, and educational purposes**.

- This software is **NOT** a medical device, Software as a Medical Device (SaMD), clinical decision support (CDS) tool, or diagnostic/therapeutic system.
- It has **NOT** been evaluated, cleared, certified, or approved by the U.S. Food and Drug Administration (FDA), the European Medicines Agency (EMA), the French ANSM, notified bodies under the EU Medical Device Regulation (EU MDR 2017/745), or any other health or regulatory authority worldwide.

### 2. No Medical Advice and No Clinical Validation
- All simulation trajectories, receptor occupancy estimates ($\theta_{CR}$), resistance probabilities ($P(\text{Resistance})$), virtual cohorts, dosing "optimizations," and goodness-of-fit metrics are mathematical outputs of simplified ordinary differential equation (ODE) abstractions.
- Curve-fitting or retrospective parameter alignment against published summary statistics (e.g., *Bartelds et al., JAMA 2011*; *Burmester et al., Ann Rheum Dis 2014*) **does not** constitute clinical validation, prospective clinical trial evidence, or individual patient predictability.
- **Outputs must NEVER be used to diagnose, treat, cure, mitigate, or prevent any disease, nor to initiate, modify, escalate, switch, or discontinue any medication or biologic therapy.**
- Always seek the advice of a licensed physician or other qualified healthcare provider with any questions regarding a medical condition or treatment.

### 3. Disclaimer of Warranties ("AS IS")
TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THIS SOFTWARE, ITS SOURCE CODE, DOCUMENTATION, PARAMETERS, AND ALL GENERATED OUTPUTS ARE PROVIDED **"AS IS"** AND **"AS AVAILABLE"**, WITH ALL FAULTS AND WITHOUT WARRANTY OF ANY KIND, EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, ACCURACY, COMPLETENESS, OR CLINICAL RELIABILITY.

### 4. Limitation of Liability & Assumption of Risk
TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE AUTHORS, COPYRIGHT HOLDERS, MAINTAINERS, OR CONTRIBUTORS OF THIS REPOSITORY BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, PRODUCT LIABILITY, OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE, INCLUDING WITHOUT LIMITATION:
- Any personal injury, bodily harm, adverse drug event, loss of therapeutic efficacy, death, or medical malpractice claim;
- Any clinical, operational, commercial, regulatory, or financial loss, data loss, or business interruption;
- Any reliance placed upon simulation outputs by human users, healthcare organizations, third-party applications, or autonomous AI agents / LLMs connected via the CLI or MCP server.

By cloning, downloading, executing, integrating, or otherwise using any part of this repository, you acknowledge that you do so **at your own sole risk** and assume full legal, regulatory, and professional responsibility for any downstream use or redistribution.

### 5. Indemnification
To the extent permitted by applicable law, you agree to indemnify, defend, and hold harmless the authors, copyright holders, and contributors from and against any third-party claims, demands, regulatory actions, damages, losses, liabilities, and legal expenses arising out of your use, modification, clinical/commercial deployment, or integration of this software or its outputs.

### 6. AI Agents, MCP & Downstream Integrations
This repository exposes an MCP server (`src/mcp-server.ts`) and CLI (`src/cli.ts`) for programmatic research workflows. Any party deploying these interfaces into a production system, SaaS product, clinical workflow, or AI assistant assumes **sole responsibility** for compliance with applicable laws and regulations (including medical device laws, healthcare privacy laws such as HIPAA/GDPR, and AI regulations such as the EU AI Act) and for placing appropriate human-in-the-loop safeguards.

### 7. Third-Party Trademarks & Scientific Citations
References to biologic therapies, molecules, targets, and published studies (including *Adalimumab*, *Tocilizumab*, *Anakinra*, *Secukinumab*, *Risankizumab*, and cited peer-reviewed articles) are used strictly for scientific identification and academic modeling context. All trademarks remain the property of their respective owners. No affiliation, sponsorship, or endorsement by any pharmaceutical manufacturer or research institution is implied.

---

## Version Française

### 1. Usage Recherche & Éducatif Uniquement (Non-Dispositif Médical)
**TwinKinétique** (incluant le moteur EDO TypeScript, l’interface web, la CLI JSON et le serveur MCP) est un logiciel théorique de modélisation mathématique *in silico* en pharmacologie quantitative des systèmes (QSP), conçu exclusivement pour la **recherche scientifique, la démonstration algorithmique et l’enseignement**.

- Ce logiciel **N’EST PAS** un dispositif médical, un logiciel dispositif médical (SaMD / DM), ni un outil d’aide à la décision clinique certifié.
- Il n’a fait l’objet **d’aucune évaluation, certification, homologation ou autorisation** par la FDA, l’EMA, l’ANSM, un organisme notifié au titre du Règlement européen (UE) 2017/745 (RDM), ou toute autre autorité sanitaire.

### 2. Absence d’Avis Médical et Absence de Validation Clinique
- Les courbes, taux d’occupation réceptorielle ($\theta_{CR}$), probabilités de résistance ($P(\text{Résistance})$), cohortes virtuelles et « optimisations » posologiques sont des résultats mathématiques issus d’un modèle simplifié d’équations différentielles ordinaires.
- L’ajustement rétrospectif sur des moyennes issues de la littérature scientifique (ex. *Bartelds et al., JAMA 2011* ; *Burmester et al., Ann Rheum Dis 2014*) **ne constitue en aucun cas une validation clinique**.
- **Les résultats ne doivent JAMAIS être utilisés pour diagnostiquer, traiter, guérir ou prévenir une maladie, ni pour initier, modifier, ajuster ou interrompre un traitement médical.**
- Consultez systématiquement un médecin ou un professionnel de santé qualifié pour toute question médicale ou thérapeutique.

### 3. Exclusion de Garantie (« TEL QUEL »)
DANS TOUTE LA MESURE PERMISE PAR LA LOI APPLICABLE, CE LOGICIEL, SON CODE SOURCE, SA DOCUMENTATION ET SES RÉSULTATS SONT FOURNIS **« TELS QUELS »**, SANS GARANTIE D’AUCUNE SORTE, EXPRESSE OU IMPLICITE, Y COMPRIS NOTAMMENT TOUTE GARANTIE DE QUALITÉ MARCHANDE, D’ADÉQUATION À UN USAGE PARTICULIER, D’EXACTITUDE SCIENTIFIQUE OU DE SÉCURITÉ CLINIQUE.

### 4. Limitation de Responsabilité & Acceptation des Risques
DANS TOUTE LA MESURE PERMISE PAR LA LOI APPLICABLE, LES AUTEURS, TITULAIRES DE DROITS, MAINTENEURS OU CONTRIBUTEURS NE POURRONT EN AUCUN CAS ÊTRE TENUS RESPONSABLES DE TOUT DOMMAGE OU PRÉJUDICE DIRECT, INDIRECT, ACCESSOIRE, SPÉCIAL OU CONSÉCUTIF (Y COMPRIS TOUT PRÉJUDICE CORPOREL, DOMMAGE CLINIQUE, ERREUR THÉRAPEUTIQUE, PERTE FINANCIÈRE OU INTERRUPTION D’ACTIVITÉ) RÉSULTANT DE L’UTILISATION, DE L’INCAPACITÉ D’UTILISER OU DE L’INTÉGRATION DE CE LOGICIEL, DE SA CLI OU DE SON SERVEUR MCP.

Tout utilisateur qui télécharge, exécute, modifie ou intègre ce dépôt le fait **à ses risques et périls exclusifs** et assume l’entière responsabilité juridique, réglementaire et professionnelle de l’usage qu’il en fait.

### 5. Marques de Tiers & Références Scientifiques
Les noms de molécules, spécialités et études cités (*Adalimumab*, *Tocilizumab*, *Anakinra*, *Secukinumab*, *Risankizumab*, publications scientifiques) sont mentionnés uniquement à des fins d’identification académique et restent la propriété exclusive de leurs détenteurs respectifs, sans aucune affiliation ni approbation.
