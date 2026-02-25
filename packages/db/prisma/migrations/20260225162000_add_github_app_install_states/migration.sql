-- CreateTable
CREATE TABLE "GithubAppInstallState" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "returnTo" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "installationId" BIGINT,
    "setupAction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GithubAppInstallState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GithubAppInstallState_state_key" ON "GithubAppInstallState"("state");

-- CreateIndex
CREATE INDEX "GithubAppInstallState_orgId_idx" ON "GithubAppInstallState"("orgId");

-- CreateIndex
CREATE INDEX "GithubAppInstallState_userId_idx" ON "GithubAppInstallState"("userId");

-- CreateIndex
CREATE INDEX "GithubAppInstallState_expiresAt_idx" ON "GithubAppInstallState"("expiresAt");

-- CreateIndex
CREATE INDEX "GithubAppInstallState_consumedAt_idx" ON "GithubAppInstallState"("consumedAt");

-- AddForeignKey
ALTER TABLE "GithubAppInstallState" ADD CONSTRAINT "GithubAppInstallState_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GithubAppInstallState" ADD CONSTRAINT "GithubAppInstallState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
