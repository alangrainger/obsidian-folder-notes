import { Plugin, TFile } from 'obsidian'

export default class FolderNotes extends Plugin {
  observer: MutationObserver

  async onload () {
    this.observer = new MutationObserver((mutations: MutationRecord[]) => {
      mutations.forEach((rec: MutationRecord) => {
        if (rec.type === 'childList') {
          (<Element>rec.target)
            // Target the folder text label elements;
            // not the '>' caret and not the blank area
            .querySelectorAll('div.nav-folder-title-content')
            .forEach((element: HTMLElement) => {
              element.onclick = (event) => {
                // Stop the normal folder click executing
                event.stopImmediatePropagation()
                event.stopPropagation()
                if (element.parentElement) {
                  const folder = element.parentElement.getAttribute('data-path')
                  const path = folder + '/' + element.innerText + '.md'
                  this.app.vault.adapter.exists(path).then(async exists => {
                    if (exists) {
                      // Open the folder note if it exists
                      const leaf = this.app.workspace.getLeaf(false)
                      const file = this.app.vault.getAbstractFileByPath(path)
                      if (file instanceof TFile) {
                        await leaf.openFile(file)
                      }
                    }
                  })
                }
              }
            })
        }
      })
    })
    this.observer.observe(document.body, {subtree: true, childList: true})
  }

  onunload () {
    this.observer.disconnect()
  }
}
