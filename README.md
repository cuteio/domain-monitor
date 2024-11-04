# Domain-monitor
A monitoring action that tracks domain names and SSL certificates expiration dates and sends timely reminders before they expire.

### Features
- Domain expiration monitoring
- SSL certificate validity tracking
- Configurable alert thresholds(GitHub Issue)

### Inputs
```
name: 'Domain & SSL Monitor'
description: 'Monitor domain expiration and SSL certificate status'

inputs:
  domains:
    description: 'List of domains to check (separated by newline)'
    required: true
  check-type:
    description: 'Type of check to perform, ssl or registry'
    required: true
  warning-days:
    description: 'Number of days before expiration to trigger warning'
    required: true
    default: 30
  github-token:
    description: 'GitHub token for creating issues'
    required: true
  assignee:
    description: 'GitHub username to assign issues to'
    required: true
```

### Example Usage

```
  check_registry:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    name: Check Registry
    steps:
      - name: Check domain registry expire date
        id: check-domain
        uses: cuteio/domain-monitor@main
        with:
          domains: |
            google.com
            x.com
          check-type: registry
          warning-days: 60
          github-token: ${{ secrets.GITHUB_TOKEN }}
          assignee: github_username,user2


  check_ssl:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    name: Check ssl

    steps:
      - name: Check domain registry expire date
        id: check-domain
        uses: cuteio/domain-monitor@main
        with:
          domains: |
            x.com
            reddit.com
            mail.google.com
          check-type: ssl
          warning-days: 30
          github-token: ${{ secrets.GITHUB_TOKEN }}
          assignee: github_username,user2
```

### For developers

```
1. install Node.js (ref https://nodejs.org/en/download/package-manager)
2. npm install
3. add some code
4. `ncc build index.js` 
5. git add & commit & push 
```
