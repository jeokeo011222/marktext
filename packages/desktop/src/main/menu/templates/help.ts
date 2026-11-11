import path from 'path'
import { shell, type BrowserWindow, type MenuItemConstructorOptions } from 'electron'
import { isFile } from 'common/filesystem'
import * as actions from '../actions/help'
import { checkUpdates } from '../actions/marktext'
import { t } from '../../i18n'

/**
 * External destinations for the Help menu, kept in one place.
 *
 * This build is maintained independently, so identity, releases, feedback and
 * source links must lead to this fork rather than to the upstream project's
 * pages. The upstream entry below is kept on purpose: supporting the original
 * project is attribution, not a claim that it hosts this build.
 */
export const HELP_LINKS = Object.freeze({
  forkRepo: 'https://github.com/jeokeo011222/marktext',
  forkReadme: 'https://github.com/jeokeo011222/marktext#readme',
  forkReleases: 'https://github.com/jeokeo011222/marktext/releases',
  forkIssues: 'https://github.com/jeokeo011222/marktext/issues',
  forkDocs: 'https://github.com/jeokeo011222/marktext/blob/develop/packages/website/content/docs/end-user/MARKDOWN_SYNTAX.md',
  forkLicense: 'https://github.com/jeokeo011222/marktext/blob/develop/LICENSE',
  upstreamSponsors: 'https://github.com/sponsors/marktext'
})

const isUpdatable = (): boolean => {
  // TODO: If not updatable, allow to check whether there is a new version available.

  const resFile = isFile(path.join(process.resourcesPath, 'app-update.yml'))
  if (!resFile) {
    return false
  } else if (process.env.APPIMAGE) {
    return true
  } else if (process.platform === 'win32' && isFile(path.join(process.resourcesPath, 'md.ico'))) {
    // Windows is a little but tricky. The update resource file is always available and
    // there is no way to check the target type at runtime (electron-builder#4119).
    // As workaround we check whether "md.ico" exists that is only included in the setup.
    return true
  }

  return false
}

export default function(): MenuItemConstructorOptions {
  const submenu: MenuItemConstructorOptions[] = [
    {
      label: t('menu.help.markdownReference'),
      click() {
        shell.openExternal(HELP_LINKS.forkDocs)
      }
    },
    {
      label: t('menu.help.changelog'),
      click() {
        shell.openExternal(HELP_LINKS.forkReleases)
      }
    },
    {
      type: 'separator'
    },
    {
      label: t('menu.help.followUs'),
      click() {
        // "Follow" now means watching this fork's repository.
        shell.openExternal(HELP_LINKS.forkReadme)
      }
    },
    {
      label: t('menu.help.support'),
      click() {
        shell.openExternal(HELP_LINKS.upstreamSponsors)
      }
    },
    {
      type: 'separator'
    },
    {
      label: t('menu.help.askQuestion'),
      click() {
        shell.openExternal(HELP_LINKS.forkIssues)
      }
    },
    {
      label: t('menu.help.reportBug'),
      click() {
        shell.openExternal(HELP_LINKS.forkIssues)
      }
    },
    {
      label: t('menu.help.viewSource'),
      click() {
        shell.openExternal(HELP_LINKS.forkRepo)
      }
    },
    {
      type: 'separator'
    },
    {
      label: t('menu.help.license'),
      click() {
        shell.openExternal(HELP_LINKS.forkLicense)
      }
    }
  ]

  const helpMenu: MenuItemConstructorOptions = {
    label: t('menu.help.help'),
    role: 'help',
    submenu
  }

  if (isUpdatable()) {
    submenu.push(
      {
        type: 'separator'
      },
      {
        label: t('menu.help.checkUpdates'),
        click(_menuItem, browserWindow) {
          checkUpdates((browserWindow as BrowserWindow | undefined) ?? null)
        }
      }
    )
  }

  if (process.platform !== 'darwin') {
    submenu.push(
      {
        type: 'separator'
      },
      {
        label: t('menu.help.about'),
        click(_menuItem, browserWindow) {
          actions.showAboutDialog(browserWindow as BrowserWindow | undefined)
        }
      }
    )
  }
  return helpMenu
}
