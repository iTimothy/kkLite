import {url,cityData} from '../../utils/base.js';
Page({
    data:{
        showMap: false,
        mapHeight: 0,
        isShow: true,
        markers:[],
        adressList:[],
        city: null,
        cityData: cityData
    },
    chooseLocation(){
        let that = this;
        wx.chooseLocation({
            success: function (respon) {
                wx.showLoading({
                    title: '加载中',
                    mask: true,
                })
                setTimeout(function(){
                    that.getAdressList(respon.longitude, respon.latitude)
                        .then(res => {
                            wx.setStorage({
                                key: 'userLngs',
                                data: {
                                    lngs: respon.longitude + ',' + respon.latitude,
                                    city: res.data.regeocode.addressComponent.province,
                                    desc: respon.address
                                },
                                success: function (res) {
                                    setTimeout(_=>{
                                        wx.redirectTo({
                                            url: '/' + that.data.from,
                                            success: function (res) { },
                                            fail: function (res) { },
                                            complete: function (res) { },
                                        })
                                    },150)
                                    
                                },
                                fail: function (res) { },
                                complete: function (res) { },
                            })
                        })
                },0)
                
            },
            cancel: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        })
    },
    getAdressList(longitude,latitude){
        return new Promise((resolve,reject) =>{
            wx.request({
                url: url.regeo,
                data: {
                    key: 'b2c732eaafd08a4d34e433fb2547e530',
                    s:'*', 
                    location: longitude+','+latitude,
                    radius:1000,
                    extensions:'all',
                    platform:'JS',
                    logversion:2.0,
                    sdkversion:1.3
                },
                method: 'GET',
                success: function(res){
                    resolve(res);
                },
                fail: function(res) {
                    reject(res);
                }
            });
        })
       
    },
    regionchange(e){
        let that = this;
        if(e.type === 'end'){
           this.mapCtx.getCenterLocation({
                type:'gcj02',
                success(res){
                    console.log(res);
                    that.setData({
                       latitude: res.latitude,
                       longitude: res.longitude,
                       'markers':[{
                            id: 0,
                            iconPath: '/asset/Marker.png',
                            latitude: res.latitude,
                            longitude: res.longitude,
                            width:32,
                            height:32 
                        }]
                   });
                   that.getAdressList(res.longitude,res.latitude)
                   .then(res=>{
                       that.setData({ adressList: res.data.regeocode.pois, city: res.data.regeocode.addressComponent.province });
                   })
                }
           }); 
        }
    },
    chooseAdress(e){
        if(e.target.dataset.lngs){
            wx.setStorageSync('userLngs',{
                lngs: e.target.dataset.lngs,
                city: this.data.city,
                desc: e.target.dataset.desc
            });
            wx.redirectTo({
                url: '/' + getCurrentPages()[0].route,
                success: function (res) { },
                fail: function (res) { },
                complete: function (res) { },
            })
        }
    },
    chooseCity(e){
        if (e.target.dataset.info) {
            let info = JSON.parse(e.target.dataset.info);
            wx.setStorageSync('userLngs', {
                lngs: info.longitude + ',' + info.latitude,
                city: info.city+'市'
            });
            wx.redirectTo({
                url: '/'+getCurrentPages()[0].route,
                success: function(res) {},
                fail: function(res) {},
                complete: function(res) {},
            })
            
        }
    },
    onLoad(options){
        this.setData({
            from: options.from.replace(/_/g,'/')
        })
    }   
})