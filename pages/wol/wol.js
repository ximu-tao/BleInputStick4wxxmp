// pages/wol/wol.js

const util = require("../../utils/util");

const app = getApp()
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    udpResData: '',
    mac: '3497f6599459'
  },
  send: function(e) {

    // 向指定的 IP 和 port 发送消息
    this.udp.send({
      address: '255.255.255.255',//192.168.31.255 ok
      port: '9',
      message: util.createMagicPacket(that.data.mac)
    })
  },

  // UDP 接收到数据的事件处理函数，参数res={message,remoteInfo}
  onUdpMessage: function(res) {
    console.log(res);

    if(res.remoteInfo.size > 0) {
      console.log(res);
      
        this.setData({

          udpResData: 'udp接收到的内容: ' + util.ab2str(res.message)
        })
      

     
    }
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that=this
      // 新建udp实例

      this.udp = wx.createUDPSocket()

      // udp绑定本机
      this.udp.bind(9999)

      // 指定接收事件处理函数,监听收到消息的事件
      this.udp.onMessage(this.onUdpMessage) 
 
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})