<template>
  <div :class="'logo-container-' + layout">
    <router-link to="/">
      <!-- 这里是logo变更的位置 -->
      <img v-if="logoUrl" :src="logoUrl" alt="logo" class="site-logo-image" />
      <svg v-else-if="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="logo">
        <path fill="none" d="M0 0h24v24H0z" />
        <path d="M1 3h4l7 12 7-12h4L12 22 1 3zm8.667 0L12 7l2.333-4h4.035L12 14 5.632 3h4.035z" />
      </svg>
      <span :class="{ 'hidden-xs-only': layout === 'horizontal' }" :title="title" class="title">
        {{ title }}
      </span>
    </router-link>
  </div>
</template>
<script>
  import { mapGetters } from 'vuex'
  import { SITE_SETTINGS_EVENT, getRuntimeLogo, getRuntimeTitle, refreshSiteSettings } from '@/utils/siteSettings'

  export default {
    name: 'VabLogo',
    data() {
      return {
        title: getRuntimeTitle(),
        logoUrl: getRuntimeLogo(),
      }
    },
    computed: {
      ...mapGetters({
        logo: 'settings/logo',
        layout: 'settings/layout',
      }),
    },
    created() {
      refreshSiteSettings(this)
        .then(({ siteName, logo }) => {
          this.title = siteName
          this.logoUrl = logo
        })
        .catch(() => {})
      this.$baseEventBus.$on(SITE_SETTINGS_EVENT, this.handleSiteSettingsChange)
    },
    beforeDestroy() {
      this.$baseEventBus.$off(SITE_SETTINGS_EVENT, this.handleSiteSettingsChange)
    },
    methods: {
      handleSiteSettingsChange(settings = {}) {
        this.title = settings.siteName || getRuntimeTitle()
        this.logoUrl = settings.logo || ''
      },
    },
  }
</script>
<style lang="scss" scoped>
  @mixin container {
    position: relative;
    height: $base-top-bar-height;
    overflow: hidden;
    line-height: $base-top-bar-height;
    background: $base-menu-background;
  }

  @mixin logo {
    display: inline-block;
    width: 34px;
    height: 34px;
    margin-right: 3px;
    color: $base-title-color;
    fill: $base-title-color;
    vertical-align: middle;
  }

  @mixin title {
    display: inline-block;
    overflow: hidden;
    font-size: 24px;
    line-height: 55px;
    color: $base-title-color;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
  }

  .logo-container-horizontal {
    @include container;

    .logo {
      @include logo;
    }

    .site-logo-image {
      @include logo;
      border-radius: 6px;
      object-fit: cover;
    }

    .title {
      @include title;
    }
  }

  .logo-container-vertical {
    @include container;

    height: $base-logo-height;
    line-height: $base-logo-height;
    text-align: center;

    .logo {
      @include logo;
      fill: #fff !important;
    }

    .site-logo-image {
      @include logo;
      border-radius: 6px;
      object-fit: cover;
    }

    .title {
      @include title;

      max-width: calc(#{$base-left-menu-width} - 60px);
      line-height: $base-logo-height; // 修复：使line-height与容器高度一致
    }
  }
</style>
