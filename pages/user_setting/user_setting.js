import {url} from '../../utils/base'
Page({
  data: {
  
  },
  onLoad: function (options) {
      let kkInfo = wx.getStorageSync('kkInfo')
      if(!kkInfo){
          wx.navigateBack()
      }
    let promise = new Promise((resolve,reject)=>{
        wx.request({
            url: url.userDetail,
            data: {
                token: kkInfo.token
            },
            success: function(res) {
                resolve(res)
            },
            fail: function(res) {
                reject(res)
            },
            complete: function(res) {},
        })
    })
    promise.then(res=>{
        res = res.data
        if(res.code == 200){
            let user = res.data.user
            this.setData({
                phone: user.phone.substr(0, 3) + '*****' + user.phone.substr(8),
                nickName: user.nickName || user.userName,
                sex: user.sex ? '女' : '男'
            })
        }
    })
    .catch(err=>{
        console.log(err)
    })
  },
  onReady: function () {
  
  },
  onShow: function () {
  
  },
  onHide: function () {
  
  },
  onUnload: function () {
  
  },
  loginOut(){
      let kkInfo = wx.getStorageSync('kkInfo')
      if(kkInfo){
          wx.removeStorageSync('kkInfo')
      }
      wx.redirectTo({
          url: '/pages/login/login',
          success: function(res) {},
          fail: function(res) {},
          complete: function(res) {},
      })
  }
})