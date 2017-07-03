import {url,cityData} from '../../utils/base.js';
import setNavbar from '../../template/navbar/navbar'
Page({
   data: {
    imgUrls: [
      'http://m.kuaikuaizuche.com/resourcenew/upload/advertImg1/20170428/654ead26c9f7415a91502c60a2af470c/1493348635170.jpg',
      'http://m.kuaikuaizuche.com/resourcenew/upload/advertImg1/20170330/3294b401016b4b8bbe898984d62e3e59/1490867978990.jpg'
    ],
    autoplay: true,
    interval: 5000,
    duration: 1000,
    isLoad: false,
    circular: true,
    postData:{
      city:'广州市',
      userLongitude:113.3198024756,
      userLatitude:23.0964441355,
      page:1,
      pageSize:10
    },
    carList:[],
    adress: '广州市',
    loadTip: '加载中',
  },
  onLoad(){
	  setNavbar(this,0)
  },
  onReachBottom(){
    if(this.data.isLoad) return;
    this.setData({isLoad: true});
    this.setData({page: this.data.postData.page++});
    this.loadCar()
    .then(res=>{
      this.setData({isLoad: false});
      res.data.data.listcar.map(index => {
          index.imagePic = 'http://192.168.1.240' + index.imagePic;
      })
      this.setData({ 'carList': this.data.carList.concat(res.data.data.listcar), loadTip: res.data.data.listcar.length < this.data.postData.pageSize ? '没有更多': '加载中'});
    })
    .catch(err=>{
      this.setData({isLoad: false});
    })
  },
  loadCar(){
    return new Promise((resolve,reject)=>{
        wx.request({
            url: url.listByCar,
            data: this.data.postData,
            method: 'POST',
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: function(res){
              resolve(res);
            },
            fail: function(res) {
              reject(res);
            }
          });
    })
   
  },
  imgLoadErr(e){
    let index = e.currentTarget.dataset.index;
    this.data.carList[index].imagePic = 'http://fpoimg.com/130x90?text=error'
  },
  chooseCity(){
    wx.navigateTo({
        url: '/pages/choose_city/choose_city?from=pages_index_index',
      success: function(res){
        // success
      },
      fail: function(res) {
        // fail
      },
      complete: function(res) {
        // complete
      }
    })
  },
  onPullDownRefresh(){
      wx.redirectTo({
        url: '/pages/index/index'
      })
  },
  onReady(){
    
  },
  onShow(){
      let userLngs = wx.getStorageSync('userLngs');
      if (userLngs){
          if(userLngs.desc){
              this.setData({ 'adress': userLngs.desc})
          } else if (userLngs.city){
              this.setData({ 'adress': userLngs.city })
          }
          this.setData({
              'postData.city': userLngs.city,
              'postData.userLongitude': userLngs.lngs.split(',')[0],
              'postData.userLatitude': userLngs.lngs.split(',')[1],
              carList: [],
              page: 1
          });
         
      }
      this.loadCar()
          .then(res => {
              res.data.data.listcar.map(index => {
                  index.imagePic = 'http://192.168.1.240' + index.imagePic;
              })
              this.setData({ 'carList': res.data.data.listcar, loadTip: res.data.data.listcar.length < this.data.postData.pageSize ? '没有更多' : '加载中' });
          });
  },
  turnToCar(e){
      wx.navigateTo({
          url: '/pages/car/car?carid=' + e.currentTarget.dataset.id,
      })
      
  },
  onShareAppMessage(options){
    return {
        title:'快快优车Lite',
        path:'/pages/index/index',
        success(res){}
    }
  }
});