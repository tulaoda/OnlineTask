const SERVER = require('../../utils/server.js')
Page({
  data: {
    imgUrls: ['https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3864886031,2376753105&fm=11&gp=0.jpg',
      'http://img2.imgtn.bdimg.com/it/u=761593304,2440317894&fm=26&gp=0.jpg'
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    grids: [0, 1, 2, 3],
    msgList: [{
      url: 'url',
      title: '消息：用户蜡笔小新完成任务，获得佣金三块'
    },
    {
      url: 'url',
      title: '消息：悦如公寓三周年生日趴邀你免费吃喝欢唱'
    },
    {
      url: 'url',
      title: '消息：你想和一群有志青年一起过生日嘛？'
    }
    ]

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(e) {
    // 小程序版本更新提示

    // 检查是否存在新版本
    wx.getUpdateManager().onCheckForUpdate(function(res) {
      // 请求完新版本信息的回调
      console.log('是否有新版本：' + res.hasUpdate)
      if (res.hasUpdate) { // 如果有新版本
        // 小程序有新版本，会主动触发下载操作（无需开发者触发）
        wx.getUpdateManager().onUpdateReady(function() { // 当新版本下载完成，会进行回调
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，单击确定重启应用',
            showCancel: false,
            success: function(res) {
              if (res.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                wx.getUpdateManager().applyUpdate()
              }
            }
          })
        })

        // 小程序有新版本，会主动触发下载操作（无需开发者触发）
        wx.getUpdateManager().onUpdateFailed(function() { // 当新版本下载失败，会进行回调
          wx.showModal({
            title: '提示',
            content: '检查到有新版本，但下载失败，请检查网络设置',
            showCancel: false
          })
        })
      }
    })


    var that = this
    //轮播图
    SERVER.getJSON('/banner/listBanner', {}, function(res) {
      const imgUrls = []
      res.data.content.map(item => {
        imgUrls.push(item.imgUrl)
      })
      that.setData({
        imgUrls: imgUrls
      })
    })

  },
  banner_detail: function() {
    wx.navigateTo({
      url: '../banner_detail/index'
    })
  },
  developing: function() {
    wx.showToast({
      title: '开发中,敬请期待!',
      icon: 'none',
      duration: 2000
    })
  },
  changeIndicatorDots: function(e) {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    })
  },
  changeAutoplay: function(e) {
    this.setData({
      autoplay: !this.data.autoplay
    })
  },
  intervalChange: function(e) {
    this.setData({
      interval: e.detail.value
    })
  },
  durationChange: function(e) {
    this.setData({
      duration: e.detail.value
    })
  }
})
