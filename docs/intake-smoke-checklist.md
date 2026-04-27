# Intake Smoke Checklist (A/B/C/D)

Use this quick check after intake changes:

## Run command

```bash
npx --yes tsx -e "import { extractPlannerIntake } from './src/lib/planner-intake/extractGoal.ts'; import { mapIntakeToPlannerState } from './src/lib/planner-intake/mapToPlannerState.ts'; const samples=[['A','Renoviram kupatilo i menjam prozore u stanu od 65 kvadrata'],['B','Planiram novu kuću od 120 kvadrata'],['C','Treba mi ograda i kapija za plac'],['D','Hoću kuhinju po meri i novu rasvetu']]; (async()=>{ for (const [id,text] of samples){ const intake=await extractPlannerIntake(text,{locale:'sr'}); const patch=mapIntakeToPlannerState(intake); console.log(JSON.stringify({id,parent:intake.parentCategory,tasks:intake.childTasks,pType:patch.pType,selTasks:patch.selTasks,start:patch.startStep},null,2)); } })();"
```

## Expected routing

- A: `reno` + `bathreno`, `winreplace`
- B: `newbuild` + `fullbuild`
- C: `yard` + `fence`, `gate`
- D: `interior` + `kitchen`, `lighting`

All should map to planner patch with `startStep: 2` for this MVP.
