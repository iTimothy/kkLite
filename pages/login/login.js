import {url} from '../../utils/base'
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let from = options.from
      this.setData({
          from: from
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
  inputHandle(e){
	  if (e.target.id === 'tel'){
		  this.setData({
			  phone: e.detail.value
		  })
	  }
	  if (e.target.id === 'pw') {
		  this.setData({
			  password: e.detail.value
		  })
	  }
  },
  login(){
      let that = this
	  if (!this.data.phone || !this.data.password || !/^(13[0-9]|15[0-9]|17[0-9]|18[0-9]|14[0-9])[0-9]{8}$/.test(this.data.phone) || this.data.password.length < 6 || this.data.password.length > 16 || this.data.phone.length !== 11 ) return;
	  wx.request({
		  url: url.login,
		  data: {
			  phone: this.data.phone,
			  password: this.data.password
		  },
		  header: {'Content-Type': 'application/x-www-form-urlencoded'},
		  method: 'post',
		  success: function(res) {
              console.log(res)
			  res = res.data
			  if(res.code == 200){
				  let user = res.data.user
				  let currentPages = getCurrentPages()
				  wx.setStorageSync('kkInfo', {
					  token: user.token,
					  phone: user.phone,
					  id: user.id
				  })
                  if (that.data.from){
                      wx.redirectTo({
                          url: '/' + that.data.from.replace(/_/g, '/'),
                      })
                      return;
                  }
				  if(currentPages.length > 1){
					  wx.navigateBack()
				  }else{
					  wx.redirectTo({
                          url: '/pages/user/user',
					  })
				  }
			  }else{
				  wx.showModal({
					  content: res.msg,
					  showCancel: false,
					  confirmColor: '#e84233',
				  })
			  }
		  },
		  fail: function(res) {
              console.log('error '+res)
			  wx.showModal({
				  content: '请求失败',
				  showCancel: false,
				  confirmColor: '#e84233',
			  })
		  },
		  complete: function(res) {},
	  })
	  
  },
})