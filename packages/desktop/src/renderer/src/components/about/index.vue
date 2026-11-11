<template>
  <div class="about-dialog">
    <el-dialog
      v-model="showAboutDialog"
      :show-close="false"
      :modal="true"
      custom-class="ag-dialog-table"
      width="400px"
    >
      <img
        class="logo"
        :src="MarkTextLogo"
      >
      <el-row>
        <el-col :span="24">
          <h3 class="title">
            {{ name }}
          </h3>
        </el-col>
        <el-col :span="24">
          <div class="text">
            {{ store.appVersion }}
          </div>
        </el-col>
        <el-col :span="24">
          <div
            class="text"
            style="min-height: auto"
          >
            {{ copyright }}
          </div>
        </el-col>
        <el-col :span="24">
          <div class="text">
            {{ copyrightContributors }}
          </div>
        </el-col>
      </el-row>
      <div class="links">
        <button
          v-for="link in links"
          :key="link.href"
          type="button"
          class="link-button"
          @click="openLink(link.href)"
        >
          {{ link.label }}
        </button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useMainStore } from '@/store'
import bus from '../../bus'
import MarkTextLogo from '../../assets/images/logo.png'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const name = 'MarkText'
const copyright = t('about.copyright', { year: new Date().getFullYear() })
const copyrightContributors = t('about.copyrightContributors')
const showAboutDialog = ref(false)

// This build is maintained independently: the About window should lead to this
// fork, not to the upstream project's pages. The last link stays as attribution.
const links = [
  { label: t('about.linkForkReadme'), href: 'https://github.com/jeokeo011222/marktext#readme' },
  { label: t('about.linkForkReleases'), href: 'https://github.com/jeokeo011222/marktext/releases' },
  { label: t('about.linkForkIssues'), href: 'https://github.com/jeokeo011222/marktext/issues' },
  { label: t('about.linkUpstream'), href: 'https://github.com/marktext/marktext' }
]

const openLink = (href: string): void => {
  window.electron.shell.openExternal(href)
}

const store = useMainStore()

const showDialog = () => {
  showAboutDialog.value = true
  bus.emit('editor-blur')
}

onMounted(() => {
  bus.on('aboutDialog', showDialog)
})

onBeforeUnmount(() => {
  bus.off('aboutDialog', showDialog)
})
</script>

<style>
.about-dialog el-row,
.about-dialog el-col {
  display: block;
}

.about-dialog img.logo {
  width: 80px;
  height: 80px;
  display: inherit;
  margin: 0 auto;
}

.about-dialog .title,
.about-dialog .text {
  min-height: 32px;
  text-align: center;
}

.about-dialog .title {
  color: var(--floatFontColor);
}

.about-dialog .text {
  color: var(--floatFontColor);
}

.about-dialog .links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 12px;
  margin: 12px 0 4px;
}

.about-dialog .link-button {
  padding: 2px 4px;
  border: none;
  background: transparent;
  color: var(--themeColor);
  font-size: 12px;
  cursor: pointer;
}

.about-dialog .link-button:hover,
.about-dialog .link-button:focus-visible {
  text-decoration: underline;
}
</style>
