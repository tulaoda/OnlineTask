// pages/type2/index.js
const SERVER = require('../../utils/server.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 2,
    page: 1,
    pageSize: 10,
    data: [],
    stateMsg: ['未提交', '审核中', '审核通过', '审核失败']
  },


  taskOrderByOpenId: function(message) {
    var that = this;
    wx.showLoading({
      title: message,
    })
    SERVER.getJSON('/taskOrder/taskOrderByOpenIdNoState', {
      'openId': wx.getStorageSync('openid'),
      // 'state': 1,
      'page': this.data.page,
      'pageSize': this.data.pageSize
    }, function(res) {
      console.log(res)
      wx.hideLoading();
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
      that.setData({
        data: that.data.data.concat(res.data.content),
        page: that.data.page + 1
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    this.taskOrderByOpenId("加载数据")
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.data.page = 1;
    this.taskOrderByOpenId('正在刷新数据')
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.data.data = []
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.taskOrderByOpenId('加载更多数据')
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})