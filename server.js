const express = require('express');
const crypto = require('crypto');
const { decrypt } = require('wechat-crypto');
const app = express();

// 配置参数
const token = '2eA68O16RJOTrgS2Kro8VhIpTVR'; // 填写你在企业微信中配置的Token
const encodingAESKey = 'B4g0OCGJ2YrzlM2xFJL8VBou4tnQGzJpI2PxMENme2D'; // 填写你在企业微信中配置的EncodingAESKey
const corpId = 'ww3911a0a761d4f706'; // 填写你的企业ID

// 解析URL编码和JSON请求体
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 处理验证请求
app.get('/wechat/callback', (req, res) => {
    const { signature, timestamp, nonce, echostr } = req.query;

    console.log('收到验证请求，参数：', { signature, timestamp, nonce, echostr });

    // 校验签名
    const sortedParams = [token, timestamp, nonce].sort().join('');
    const sha1 = crypto.createHash('sha1');
    sha1.update(sortedParams);
    const computedSignature = sha1.digest('hex');

    console.log('计算出的签名：', computedSignature);

    if (computedSignature === signature) {
        console.log('验证成功，返回echostr');
        res.send(echostr); // 验证成功，返回echostr
    } else {
        console.log('验证失败，签名不匹配');
        res.status(403).send('Invalid signature'); // 验证失败
    }
});

// 处理消息推送
app.post('/wechat/callback', (req, res) => {
    const { signature, timestamp, nonce, encrypt } = req.body;

    console.log('收到消息推送，参数：', { signature, timestamp, nonce, encrypt });

    // 校验签名
    const sortedParams = [token, timestamp, nonce, encrypt].sort().join('');
    const sha1 = crypto.createHash('sha1');
    sha1.update(sortedParams);
    const computedSignature = sha1.digest('hex');

    console.log('计算出的签名：', computedSignature);

    if (computedSignature === signature) {
        // 解密消息
        const { message } = decrypt(encodingAESKey, encrypt, corpId);
        console.log('解密后的消息：', message);

        // 处理消息逻辑
        res.send('success'); // 返回成功响应
    } else {
        console.log('验证失败，签名不匹配');
        res.status(403).send('Invalid signature'); // 验证失败
    }
});

// 启动服务器
const port = process.env.PORT || 3000; // 使用 Vercel 提供的端口
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});