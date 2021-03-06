package com.ssh.controller;

import com.ssh.entity.Banner;
import com.ssh.entity.User;
import com.ssh.service.UserService;
import com.ssh.utils.HttpRequest;
import com.ssh.wxpay.constant.Constant;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import net.sf.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

//import com.ssh.utils.AesCbcUtil;


@Api(value = "user")
@Controller
@RequestMapping(value = "/user") // 通过这里配置使下面的映射都在/users下，可去除
public class UserController {
    @Autowired
    private UserService userService;

    @ApiImplicitParams(
            {@ApiImplicitParam(name = "code", value = "小程序登录时获取的code", required = true, dataType = "string"),
                    @ApiImplicitParam(name = "encryptedData", value = "密文 encryptedData", required = true, dataType = "string"),
                    @ApiImplicitParam(name = "iv", value = "偏移向量 iv", required = true, dataType = "string")
            })
    @ResponseBody
    @RequestMapping(value = "getOpenId", method = RequestMethod.GET)
    public Map getOpenId(String encryptedData, String iv, String code) {

        Map map = new HashMap();
        //登录凭证不能为空
        if (code == null || code.length() == 0) {
            map.put("status", 0);
            map.put("msg", "code 不能为空");
            return map;
        }

        //小程序唯一标识   (在微信小程序管理后台获取)
        String wxspAppid = Constant.APP_ID;
        //小程序的 app secret (在微信小程序管理后台获取)
        String wxspSecret = Constant.APP_SECRET;
        //授权（必填）
        String grant_type = "authorization_code";


        //////////////// 1、向微信服务器 使用登录凭证 code 获取 session_key 和 openid ////////////////
        //请求参数
        String params = "appid=" + wxspAppid + "&secret=" + wxspSecret + "&js_code=" + code + "&grant_type=" + grant_type;
        //发送请求
        String sr = HttpRequest.sendGet("https://api.weixin.qq.com/sns/jscode2session", params);
        //解析相应内容（转换成json对象）
        JSONObject json = JSONObject.fromObject(sr);
        //获取会话密钥（session_key）
        String session_key = json.get("session_key").toString();
        //用户的唯一标识（openid）
        String openid = (String) json.get("openid");
        if (openid != "") {
            map.put("status", 1);
            map.put("msg", "解密成功");
            map.put("openid", openid);
            return map;
        }

        //////////////// 2、对encryptedData加密数据进行AES解密 ////////////////
//        try {
//            String result = AesCbcUtil.decrypt(encryptedData, session_key, iv, "UTF-8");
//            if (null != result && result.length() > 0) {
//                map.put("status", 1);
//                map.put("msg", "解密成功");
//
//                JSONObject userInfoJSON = JSONObject.fromObject(result);
//                Map userInfo = new HashMap();
//                userInfo.put("openId", userInfoJSON.get("openId"));
//                userInfo.put("nickName", userInfoJSON.get("nickName"));
//                userInfo.put("gender", userInfoJSON.get("gender"));
//                userInfo.put("city", userInfoJSON.get("city"));
//                userInfo.put("province", userInfoJSON.get("province"));
//                userInfo.put("country", userInfoJSON.get("country"));
//                userInfo.put("avatarUrl", userInfoJSON.get("avatarUrl"));
//                userInfo.put("unionId", userInfoJSON.get("unionId"));
//                map.put("userInfo", userInfo);
//                return map;
//            }
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
        map.put("status", 500);
        map.put("msg", "解密失败");
        return map;
    }


    @RequestMapping(value = "register", method = RequestMethod.GET)
    @ResponseBody
    public Map register(String openid,
                        String name,
                        String wechat,
                        String alipay,
                        String address,
                        String telephone) {
        Map map = new HashMap();
        User user;
        if (userService.getUserByOpenId(openid) == null) {
            user = new User();
            user.setOpenid(openid);
            user.setName(name);
            user.setWechat(wechat);
            user.setAlipay(alipay);
            user.setAddress(address);
            user.setTelephone(telephone);
            userService.save(user);
            map.put("code", 200);
            return map;
        } else {
            user = userService.getUserByOpenId(openid);
            user.setOpenid(openid);
            user.setName(name);
            user.setWechat(wechat);
            user.setAlipay(alipay);
            user.setAddress(address);
            user.setTelephone(telephone);
            userService.saveOrUpdate(user);
            map.put("code", 200);
            return map;
        }
    }


    @RequestMapping(value = "updateFormId", method = RequestMethod.GET)
    @ResponseBody
    public Map<String, String> findUser(String openId, String formId) {
        Map<String, String> map = new HashMap<String, String>();
        User user = userService.getUserByOpenId(openId);
        user.setFormId(formId);
        userService.saveOrUpdate(user);
        if (user == null) {
            map.put("msg", "执行失败！");
            return map;
        }
        map.put("msg", "200");
        return map;
    }

    @RequestMapping(value = "findUser", method = RequestMethod.GET)
    @ResponseBody
    public Map<String, String> findUser(String openId) {
        Map<String, String> map = new HashMap<String, String>();
        User user = userService.getUserByOpenId(openId);
        if (user == null) { 
            map.put("msg", "执行失败！");
            return map;
        }
        map.put("name", user.getName());
        map.put("tel", user.getTelephone());
        map.put("address", user.getAddress());
        map.put("wechat", user.getWechat());
        map.put("alipay", user.getAlipay());
        map.put("msg", "200");
        return map;
    }


    @RequestMapping(value = "findAllUser", method = RequestMethod.GET)
    @ResponseBody
    public Map findAllUser() {
        Map map = new HashMap();
        List<User> list = null;
        try {
            list = userService.findAll();
            map.put("data", list);
            map.put("msg", "执行成功！");
            map.put("code", 200);
            return map;
        } catch (Exception e) {
            e.printStackTrace();
        }
        map.put("data", list);
        map.put("msg", "执行失败");
        map.put("code", 500);
        return map;
    }


}
