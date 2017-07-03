const setNavbar = (handler,index) =>{
	let navConfigArr= [
		{
			text:'首页',
			active: false
		},
		{
			text: '搜索',
			active: false
		},
		{
			text: '行程',
			active: false
		},
		{
			text: '我的',
			active: false
		}
	]
	navConfigArr[index].active = true
	handler.setData({
		navConfigArr: navConfigArr
	})
	return handler
	
}
export default setNavbar