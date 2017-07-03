import {url} from '../../utils/base'
Page({
  data: {
      toggleStatus: 0,
      sfzIsSelect: true,
      drzIsSelect: true,
      drfIsSelect: true,
  },
  onLoad: function (options) {

    wx.getStorage({
        key: 'kkInfo',
        success: function(res) {
            this.setData({
                token: res.data.token
            })
            
        }.bind(this),
        fail: function(res) {},
        complete: function(res) {},
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
  onPullDownRefresh: function () {
       wx.redirectTo({
           url: '/pages/authenticate/authenticate',
       })
  },
  selectPic(e) {
      let that = this
      let type = e.currentTarget.dataset.type
      wx.chooseImage({
          success: function (res) {
              if (type === 'sfz'){
                  that.setData({
                      sfzImg: res.tempFilePaths[0],
                      sfzIsSelect: false
                  })
              }
              if (type === 'drz') {
                  that.setData({
                      drzImg: res.tempFilePaths[0],
                      drzIsSelect: false
                  })
              }
              if (type === 'drf') {
                  that.setData({
                      drfImg: res.tempFilePaths[0],
                      drfIsSelect: false
                  })
              }
          },
      })
  },
  submitPic(){
      wx.uploadFile({
          url: url.uploadRenterImage,
          filePath: this.data.sfzImg,
          name: 'file1',
          header: { 'content-type':'multipart/form-data'},
          formData: {
              file2: this.data.drzImg,
              file3: this.data.drfImg,
              token: this.data.token
          },
          success: function(res) {
              console.log(res)
          },
          fail: function(res) {
              console.warn(res)
          },
          complete: function(res) {},
      })
  }
})