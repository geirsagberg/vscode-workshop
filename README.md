# VS Code extensions workshop

Slides:

```
npm install
npm start
```

## Kom i gang

```
npx --package yo --package generator-code -- yo code
```

Docs: https://code.visualstudio.com/api/get-started/your-first-extension

API: https://code.visualstudio.com/api/references/vscode-api

## Oppgaver

### 1. Autokryptering mens du skriver

Lag en extension som krypterer koden du skriver underveis, på en meget sofistikert måte.

Extensionen skal fungere slik:

- Når man trykker Enter i editor, reverser teksten før cursor på samme linje, og hopp til ny linje som vanlig
- Men, hvis man har valgt tekst, skal Enter i stedet reversere all tekst, linje for linje, uten å hoppe til ny linje

Hint:

- Du må definere én command og én keybinding i package.json
- Relevante API:
  - `vscode.commands.registerCommand`
  - `vscode.window.activeTextEditor`
  - `vscode.commands.executeCommand`

[Løsningsforslag](./ex-1/)

### 2. Fargedekorator

Legg ved en fargedekorator når man skriver en CSS-farge eller en hexkode.

Hint:

- `vscode.window.createTextEditorDecorationType`

[Løsningsforslag](./ex-2/)

### 3. Lorem ipsum

Hvis du skriver "lorem ipsum" og trykker enter, skal det komme masse lorem ipsum-tekst.

Bonus: gjør det mulig å definere antall paragrafer, f.eks. `lorem ipsum*5`

[Løsningsforslag](./ex-3/)

### 4. Emmet

Emmet er en kjent plugin som gjør det mulig å skrive forkortelser for å generere HTML. Eksempel:

```
div>ul>li
```

blir til:

```
<div>
    <ul>
        <li></li>
    </ul>
</div>
```

og setter pekeren din inne i `<li>`-elementet.

Lag en extension som støtter et begrenset utvalg forkortelser. Du kan velge om den skal erstatte ved Enter, Tab eller en annen key.

### 5. LLM Autocomplete

Hvor vanskelig er det å lage sin egen GitHub Copilot?
