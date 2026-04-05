<template>
  <div class="vab-ad">
    <el-carousel v-if="adList" :autoplay="true" :interval="3000" direction="vertical" height="30px" indicator-position="none">
      <el-carousel-item v-for="(item, index) in adList" :key="index">
        <el-tag type="warning">公告</el-tag>
        <a href="javascript:void(0)" @click.prevent="openNoticeCenter(item)">{{ item.title }}</a>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>
<script>
  import { getPublishedNotices } from '@/api/noticeManagement'

  export default {
    name: 'VabAd',
    data() {
      return {
        nodeEnv: process.env.NODE_ENV,
        adList: [],
      }
    },
    created() {
      this.fetchData()
    },
    methods: {
      async fetchData() {
        const { data } = await getPublishedNotices({ pageSize: 10 })
        this.adList = data
      },
      openNoticeCenter(item) {
        this.$router.push({ name: 'Notification', query: { noticeId: item.id } })
      },
    },
  }
</script>
<style lang="scss" scoped>
  .vab-ad {
    margin-top: 7px;
    height: 30px;
    padding-right: $base-padding;
    padding-left: $base-padding;
    margin-bottom: -20px;
    line-height: 32px;
    cursor: pointer;

    a {
      margin-left: 5px;
      color: #888;
    }

    ::v-deep {
      .el-carousel__container {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
  }
</style>
