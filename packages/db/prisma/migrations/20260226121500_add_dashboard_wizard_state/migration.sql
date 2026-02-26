-- CreateTable
CREATE TABLE "DashboardWizardState" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "acknowledgedSteps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dismissedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardWizardState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DashboardWizardState_orgId_userId_key" ON "DashboardWizardState"("orgId", "userId");

-- CreateIndex
CREATE INDEX "DashboardWizardState_orgId_idx" ON "DashboardWizardState"("orgId");

-- CreateIndex
CREATE INDEX "DashboardWizardState_userId_idx" ON "DashboardWizardState"("userId");

-- AddForeignKey
ALTER TABLE "DashboardWizardState" ADD CONSTRAINT "DashboardWizardState_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardWizardState" ADD CONSTRAINT "DashboardWizardState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
