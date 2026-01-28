# Smart License Version Status Flow

## Available states

### 1. `draft` - Draft version
- Description: Work in progress by the creator
- Color: Gray (`secondary`)
- When: Initial creation or not yet finalized changes

### 2. `proposed` - Proposed version
- Description: Proposed for validator approval
- Color: Blue (`primary`)
- When: Creator completed the version and submitted it for approval

### 3. `needs_revision` - Needs revision
- Description: Rejected and requires changes
- Color: Orange (`warning`)
- When: Validator rejected the version and requested updates

### 4. `approved` - Approved
- Description: Approved by the validator
- Color: Green (`success`)
- When: Validator approved the version but it is not deployed yet

### 5. `deployed` - Deployed
- Description: Deployed and active in the system
- Color: Green (`success`)
- When: Version is active and operational

### 6. `superseded` - Superseded
- Description: Replaced by a newer version
- Color: Light gray (`light`)
- When: A new version replaces the current one

## Transition flow

```
draft -> proposed -> approved -> deployed
  |         |
  v         v
needs_revision <--------
  |
  v
proposed (new version)
```

## Example in demo-license.json

### Version 1: `superseded`
- History: `proposed` -> `under_review` -> `needs_revision` -> `superseded`
- Reason: Rejected due to high royalties and long duration
- Feedback: "Royalty rates too high, reduce by 30%, duration too long"

### Version 2: `superseded`
- History: `proposed` -> `under_review` -> `needs_revision` -> `superseded`
- Reason: Rejected due to missing additional sensor integration
- Feedback: "Need additional sensor suite integration"

### Version 3: `deployed`
- History: `proposed` -> `under_review` -> `approved` -> `deployed`
- Reason: Approved and deployed successfully
- Feedback: "Excellent improvements! Approved for deployment"

## Business logic

1. Creator proposes a version (`proposed`)
2. Validator decides:
   - Approve -> `approved` -> `deployed`
   - Reject -> `needs_revision` -> creator makes a new version
3. Previous version becomes `superseded` when a new version is created

## UI implementation

- Navigation tabs show all states with consistent colors
- Feedback section is shown only for versions with feedback
- Status badges use consistent colors
- Version details show the full history of each version

## Status colors

- Draft: Gray (`secondary`)
- Proposed: Blue (`primary`)
- Needs Revision: Orange (`warning`)
- Approved: Green (`success`)
- Deployed: Green (`success`)
- Superseded: Light gray (`light`)
