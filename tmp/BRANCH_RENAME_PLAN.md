# Branch Rename: master → main

## ✅ Why Now is Perfect

You're absolutely right - **pre-release is the ideal time** for this infrastructure change:

- ✅ No published packages yet (no external dependencies)
- ✅ Active development phase (can coordinate with team)
- ✅ Already on feature branch (won't disrupt current work)
- ✅ Modern standard alignment (inclusive language)

## ✅ Already Prepared

Good news - most infrastructure already supports both:

1. **GitHub Actions workflows** - Already trigger on both `master` and `main`:
   ```yaml
   on:
     push:
       branches: [ master, main ]  # ✅ Already compatible
   ```

2. **Changeset config** - Now points to "main" ✅
3. **Package.json download URL** - Updated to "main" ✅

## 🚀 Branch Rename Steps

### Step 1: Rename Local Branch

```bash
# From your current feature branch
git checkout master
git branch -m master main
git push -u origin main
```

### Step 2: Update GitHub Default Branch (Web UI)

1. Go to: `https://github.com/istvan-ujjmeszaros/bootstrap-touchspin/settings/branches`
2. Under "Default branch", click the switch icon (⇄)
3. Select `main` from dropdown
4. Click "Update" then confirm

**This will:**
- Make `main` the default for new PRs
- Update clone/fork defaults
- Redirect old `master` links automatically

### Step 3: Delete Old Remote Branch

```bash
# After confirming main is the new default
git push origin --delete master
```

### Step 4: Update Current Feature Branch

```bash
# Update your feature branch to track new base
git checkout codex/framework-wrappers
git branch --set-upstream-to=origin/main
git rebase main  # Rebase onto new main branch
```

### Step 5: Notify Team (If Applicable)

**For contributors with local clones:**

```bash
# Update their local repo
git checkout master
git branch -m master main
git fetch origin
git branch -u origin/main main
git remote set-head origin -a
```

Or simpler:
```bash
git fetch origin
git checkout main
git branch -D master  # Delete old local master
```

## 📋 Verification Checklist

After rename:

- [ ] GitHub default branch shows "main"
- [ ] New PRs target "main" by default
- [ ] `git clone` checks out "main" by default
- [ ] Workflows trigger on pushes to "main"
- [ ] Changesets detect "main" as base branch
- [ ] Documentation links work (GitHub auto-redirects master → main)

## 🎯 Impact Assessment

### ✅ No Breaking Changes

- GitHub automatically redirects `master` → `main` in URLs
- Existing clones continue to work (can manually update)
- CI/CD workflows already support both branches
- No published packages to update

### ⏱️ Time Required

- **Rename + GitHub config**: 5 minutes
- **Update current feature branch**: 2 minutes
- **Team notification**: As needed

**Total: ~10 minutes**

## 🔄 Updated Workflow After Rename

1. **Current PR** (this release-readiness work):
   ```bash
   git rebase main  # Instead of master
   # Open PR → targets "main" automatically
   ```

2. **Changesets Release PR**:
   - Will compare against "main" ✅
   - Will merge into "main" ✅

3. **Future branches**:
   ```bash
   git checkout main  # Not master
   git pull
   git checkout -b feature/new-thing
   ```

## 📝 Documentation Updates Needed

None! The rename was already accounted for:

- ✅ Changeset config: `"baseBranch": "main"`
- ✅ Download URL: `archive/main.zip`
- ✅ Workflows: Trigger on both (will work with main)
- ✅ README: No hardcoded "master" references

## 🎉 Benefits

1. **Modern standard** - Aligns with GitHub/Git defaults (2020+)
2. **Inclusive language** - Industry best practice
3. **Future-proof** - New contributors expect "main"
4. **Clean slate** - Perfect timing before v5 release

## ⚠️ One Consideration

**If this is a fork or has multiple maintainers:**
- Coordinate timing via Slack/email
- Share the team update commands
- Consider a brief "freeze" during rename (< 1 hour)

**If solo maintainer:**
- Proceed immediately - no coordination needed

## 🚦 Recommendation

**Execute the rename RIGHT NOW** before continuing with release work:

```bash
# 1. Rename (2 min)
git checkout master
git branch -m master main
git push -u origin main

# 2. Update GitHub default (1 min)
# Via web UI: Settings → Branches → Default branch → main

# 3. Delete old branch (30 sec)
git push origin --delete master

# 4. Rebase feature branch (1 min)
git checkout codex/framework-wrappers
git branch --set-upstream-to=origin/main
git rebase main

# 5. Continue with release work
# Open PR → targets "main" automatically ✅
```

---

## 📊 Updated Fix Summary

The corrected fix is now:

~~❌ Fix Changeset baseBranch from "main" to "master"~~

✅ **Rename default branch from "master" to "main"**
- Modern standard alignment
- Changeset config already correct (`baseBranch: "main"`)
- Download URL updated
- Workflows already compatible

**Total time: 10 minutes**
**Risk: Minimal (pre-release, workflows compatible)**
**Benefit: Modern, inclusive, future-proof**

---

_You were absolutely right - this IS the perfect time!_
