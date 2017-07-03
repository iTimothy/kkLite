String.prototype.set = function(origin){
    return (origin ? origin : 'http://192.168.1.240') + this;
};
export const url = {
    listByCar: '/Kkzc/carwapapi/listByCar.do'.set(),
    regeo: 'http://restapi.amap.com/v3/geocode/regeo',
    carDetail: '/Kkzc/carwapapi/carDetail.do'.set(),
    carComment: '/Kkzc/carwapapi/carComment.do'.set(),
    collectCar: '/Kkzc/carwapapi/collectCar.do'.set(),
    cancelCollectCar: '/Kkzc/carwapapi/cancelCollectCar.do'.set(),
    userDetail: '/Kkzc/userwapapi/userDetail.do'.set(),
    userSetPwd: '/Kkzc/userwapapi/userSetPwd.do'.set(),
	orderInfo: '/Kkzc/orderwapapi/orderInfo.do'.set(),
	getCarDoorMoneyLimitArea: '/Kkzc/carwapapi/getCarDoorMoneyLimitArea.do'.set(),
	addOrder: '/Kkzc/orderwapapi/addOrder.do'.set(),
	login: '/Kkzc/userwapapi/login.do'.set(),
    getUserMoney: '/Kkzc/userwapapi/getUserMoney.do'.set(),
    communityDetail: '/Kkzc/carwapapi/communityDetail.do'.set(),
    getCarCategory: '/Kkzc/dicapi/getCarCategory.do'.set(),
    getDistrict: '/Kkzc/leasingwapapi/getDistrict.do'.set(),
    getLeasingCompany: '/Kkzc/leasingwapapi/getLeasingCompany.do'.set(),
    listOrder:'/Kkzc/orderwapapi/listOrder.do'.set(),
    confirmOrder: '/Kkzc/orderwapapi/confirmOrder.do'.set(),
    uploadRenterImage: '/Kkzc/userwapapi/uploadRenterImage.do'.set(),
};

export let cityData = [
    { "city": "广州","longitude":"113.3198024756","latitude":"23.0964441355"},
    { "city": "深圳","longitude":"114.1021300000","latitude":"22.5403410000"}, 
    {"city":"佛山","longitude":"113.10389","latitude":"23.047559"}, 
    {"city":"重庆","longitude":"106.550763","latitude":"29.56471"}, 
    {"city":"长沙", "longitude":"113.009658", "latitude":"28.170261"}, 
    {"city":"海口","longitude":"110.199874","latitude":"20.044276"}, 
    {"city":"三亚","longitude":"109.512085","latitude":"18.25245"}, 
    {"city":"武汉","longitude":"114.305393", "latitude":"30.593099"}
];

if (!Array.prototype.map) {
    Array.prototype.map = function (callback, thisArg) {
        var T, A, k;
        if (this == null) {
            throw new TypeError(" this is null or not defined");
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if (Object.prototype.toString.call(callback) != "[object Function]") {
            throw new TypeError(callback + " is not a function");
        }
        if (thisArg) {
            T = thisArg;
        }
        A = new Array(len);
        k = 0;
        while (k < len) {
            var kValue, mappedValue;
            if (k in O) {
                kValue = O[k];
                mappedValue = callback.call(T, kValue, k, O);
                A[k] = mappedValue;
            }
            k++;
        }
        return A;
    };
}