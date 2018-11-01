// index.js
// 获取应用实例
import WxValidate from '../../utils/WxValidate'
import weui from '../../utils/WxValidate'
const SERVER = require('../../utils/server.js')
const app = getApp()
Page({
  data: {
    value1: '',
    value2: '',
    value3: '',
    value4: '',
    value5: '',
    value6: '',
    value7: '',
    school: '天津工业大学',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    array: ['天津工业大学'],
    objectArray: [{
      id: 0,
      name: '天津工业大学'
    }],
    index: 0
  },

  onLoad: function() {
    this.getUser()
    // this.initValidate()
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  // 获取用户信息
  getUser: function() {
    var that = this
    SERVER.getJSON('/user/findUser', {
      openId: wx.getStorageSync('openid')
    }, function(res) {
      that.setData({
        value1: res.data.tel,
        value2: res.data.address,
        value3: res.data.name
      })
    })
    // console.log(username + address + phone + school + openid)
  },
  bindPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', this.data.array[e.detail.value])
    this.setData({
      index: e.detail.value,
      school: this.data.array[e.detail.value]
    })
  },
  onInputUsername: function(e) {
    this.setData({
      username: e.detail.value
    })
  },
  onInputAddress: function(e) {
    this.setData({
      address: e.detail.value
    })
  },
  onInputPhone(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  showModal(error) {
    wx.showModal({
      content: error.msg,
      showCancel: false
    })
  },
  saveUserInfo: function(e) {
    const {
      username,
      address,
      phone,
      school
    } = this.data
    const openid = wx.getStorageSync('openid')
    // 数据校验
    this.initValidate()

    if (username == '') {
      wx.showModal({
        content: '请输入姓名',
        showCancel: false
      })
      return
    }
    if (address == '') {
      wx.showModal({
        content: '请输入地址',
        showCancel: false
      })
      return
    }
    if (school == '') {
      wx.showModal({
        content: '请选择学校',
        showCancel: false
      })
      return
    }
    if (phone == '') {
      wx.showModal({
        content: '请输入手机号',
        showCancel: false
      })
      return
    }
    if (!/^1[34578]\d{9}$/.test(phone)) {
      wx.showModal({
        content: '请输入正确的手机号码',
        showCancel: false
      })
      return
    }
    // if (!this.validate.checkForm(e)) {
    //   const error = this.validate.errorList[0]
    //   return alert(error.msg)
    // }
    // 保存用户信息
    SERVER.getJSON('/user/register', {
      name: username,
      address: address,
      telephone: phone,
      school: school,
      openid: openid
    }, function(res) {
      if (res.data.user != '') {
        wx.showToast({
          title: '提交成功',
          icon: 'success',
          showCancel: false
        })
        setTimeout(function() {
          wx.switchTab({
            url: '../mine/index'
          })
        }, 1000)
      }
      // console.log(res.data)
      // let imgUrls = [];
      // res.data.content.map(item => {
      //   imgUrls.push(item.imgUrl)
      // });
      // that.setData({
      //   imgUrls: imgUrls,
      // })
    })
    console.log(username + address + phone + school + openid)
  },

  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  initValidate() {
    this.validate = new WxValidate({
      phone: {
        required: true,
        tel: true
      },
      code: {
        required: true
      }
    }, {
      phone: {
        required: '请输入手机号',
        tel: '请输入有效手机号码'
      },
      code: {
        required: '请输入验证码'
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    console.log('sdd')
    wx.showModal({
      title: '提示',
      content: '请输入有效手机号码',
      showCancel: false
    })
  }
})
