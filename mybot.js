const { Wechaty, Room } = require('wechaty')
const request = require('request');

const tulingUrl = 'http://openapi.tuling123.com/openapi/api/v2';
const API_KEY = "9bcdb081db0c4ea18b8890c471ba21b7";
const USER_ID = '276757';

Wechaty.instance()
	.on('scan', (url, code) => {
		if (!/201|200/.test(String(code))) {
			const loginUrl = url.replace(/\/qrcode\//, '/l/')
			require('qrcode-terminal').generate(loginUrl)
		}
		console.log(url)
	})

	.on('login', user => {
		console.log(`${user} login`)
	})

	.on('friend', async function (contact, request) {
		if (request) {
			await request.accept()
			console.log(`Contact: ${contact.name()} send request ${request.hello}`)
		}
	})

	.on('message', async function (m) {
        if (m.self()) {
			return;
		}
		const contact = m.from()
		const content = m.content()
        const room = m.room()

        let requestData = {
            reqType: 0,
            perception: {
                inputText: {
                    text: content
                }
            },
            userInfo: {
                apiKey: API_KEY,
                userId: USER_ID
            }
        };


		if (room && room.topic() === 'Chatbot') {
            request({
                url: tulingUrl,
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: requestData
            }, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    let content = body.results[0].values.text;
                    console.log('content=====', content);
                    m.say(content);
                }
            });
            console.log(`Room: ${room.topic()} Contact: ${contact.name()} Content: ${content}`)
        } else {
            request({
                url: tulingUrl,
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: requestData
            }, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    let content = body.results[0].values.text
                    console.log('content', content);
                }
            });
        }

		if (/hello/.test(content)) {
			m.say("hello how are you")
		}

		if (/room/.test(content)) {
			let keyroom = await Room.find({ topic: "test" })
			if (keyroom) {
				await keyroom.add(contact)
				await keyroom.say("welcome!", contact)
			}
		}

		if (/out/.test(content)) {
			let keyroom = await Room.find({ topic: "test" })
			if (keyroom) {
				await keyroom.say("Remove from the room", contact)
				await keyroom.del(contact)
			}
		}
	})

	.start()