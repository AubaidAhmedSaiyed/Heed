-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BehaviorProfile" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "actionFrequency" JSONB NOT NULL,
    "systemFrequency" JSONB NOT NULL,
    "resourceFrequency" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BehaviorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionTransition" (
    "id" TEXT NOT NULL,
    "behaviorProfileId" TEXT NOT NULL,
    "fromAction" TEXT NOT NULL,
    "toAction" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ActionTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionContract" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "expectedActions" TEXT[],
    "allowedSystems" TEXT[],
    "allowedCapabilities" TEXT[],
    "restrictedResources" TEXT[],
    "maxActions" INTEGER,
    "maxExternalWrites" INTEGER,
    "forbiddenCapabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "forbiddenResourcePatterns" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "forbiddenProvenance" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "terminationConditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "flowRules" JSONB,
    "noGoPatterns" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutionContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Execution" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "evaluationMode" TEXT NOT NULL DEFAULT 'ENFORCE',
    "objective" TEXT NOT NULL,
    "authorityType" TEXT,
    "authorityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Execution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionPolicySnapshot" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "policyVersionId" TEXT NOT NULL,
    "activeAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutionPolicySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionEvent" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "system" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "capability" TEXT,
    "resource" TEXT NOT NULL,
    "resourceType" TEXT,
    "sensitivity" TEXT NOT NULL,
    "impact" TEXT NOT NULL DEFAULT 'LOW',
    "payloadMetadata" JSONB,
    "status" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idempotencyKey" TEXT,
    "provenanceLabels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "provenanceSource" TEXT,
    "destinationType" TEXT,
    "destinationIdentifier" TEXT,
    "policySnapshotId" TEXT,

    CONSTRAINT "ActionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL,
    "actionEventId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "deviationScore" INTEGER NOT NULL,
    "reasons" TEXT[],
    "reasonCode" TEXT,
    "matchedPolicies" JSONB,
    "constraints" JSONB,
    "approvalRequirements" JSONB,
    "evidenceMetadata" JSONB,
    "trajectoryContext" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Intervention" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "actionEventId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "humanDecision" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Intervention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousEventHash" TEXT,
    "currentEventHash" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Connector" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capabilities" TEXT[],
    "status" TEXT NOT NULL,
    "workspaceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Connector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyVersion" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "flowRules" JSONB NOT NULL DEFAULT '[]',
    "noGoPatterns" JSONB NOT NULL DEFAULT '[]',
    "forbiddenCapabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "boundApprovalCapabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "effectiveAt" TIMESTAMP(3),
    "supersedesVersion" INTEGER,
    "policyHash" TEXT NOT NULL,

    CONSTRAINT "PolicyVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalBinding" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "actionEventId" TEXT NOT NULL,
    "system" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "capability" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "argumentsHash" TEXT NOT NULL,
    "provenanceHash" TEXT NOT NULL,
    "destinationHash" TEXT NOT NULL,
    "policySnapshotId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "consumedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalBinding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMembership_userId_workspaceId_key" ON "WorkspaceMembership"("userId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE UNIQUE INDEX "BehaviorProfile_agentId_key" ON "BehaviorProfile"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "ActionTransition_behaviorProfileId_fromAction_toAction_key" ON "ActionTransition"("behaviorProfileId", "fromAction", "toAction");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionContract_executionId_key" ON "ExecutionContract"("executionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionPolicySnapshot_executionId_policyVersionId_key" ON "ExecutionPolicySnapshot"("executionId", "policyVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "ActionEvent_idempotencyKey_key" ON "ActionEvent"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "Decision_actionEventId_key" ON "Decision"("actionEventId");

-- CreateIndex
CREATE UNIQUE INDEX "Intervention_actionEventId_key" ON "Intervention"("actionEventId");

-- CreateIndex
CREATE UNIQUE INDEX "Connector_name_key" ON "Connector"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_name_workspaceId_key" ON "Policy"("name", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyVersion_policyId_version_key" ON "PolicyVersion"("policyId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalBinding_actionEventId_key" ON "ApprovalBinding"("actionEventId");

-- AddForeignKey
ALTER TABLE "WorkspaceMembership" ADD CONSTRAINT "WorkspaceMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMembership" ADD CONSTRAINT "WorkspaceMembership_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BehaviorProfile" ADD CONSTRAINT "BehaviorProfile_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionTransition" ADD CONSTRAINT "ActionTransition_behaviorProfileId_fkey" FOREIGN KEY ("behaviorProfileId") REFERENCES "BehaviorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionContract" ADD CONSTRAINT "ExecutionContract_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "Execution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Execution" ADD CONSTRAINT "Execution_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionPolicySnapshot" ADD CONSTRAINT "ExecutionPolicySnapshot_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "Execution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionPolicySnapshot" ADD CONSTRAINT "ExecutionPolicySnapshot_policyVersionId_fkey" FOREIGN KEY ("policyVersionId") REFERENCES "PolicyVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionEvent" ADD CONSTRAINT "ActionEvent_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "Execution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_actionEventId_fkey" FOREIGN KEY ("actionEventId") REFERENCES "ActionEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "Execution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_actionEventId_fkey" FOREIGN KEY ("actionEventId") REFERENCES "ActionEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "Execution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connector" ADD CONSTRAINT "Connector_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyVersion" ADD CONSTRAINT "PolicyVersion_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalBinding" ADD CONSTRAINT "ApprovalBinding_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "Execution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalBinding" ADD CONSTRAINT "ApprovalBinding_actionEventId_fkey" FOREIGN KEY ("actionEventId") REFERENCES "ActionEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

