import SferaMessage from "./SferaMessage"
import {Request} from 'express'
export default class SferaPeer {
	wsConn: WebSocket
	nickname: string
	ipAddress: string
	onMessage: (ev: MessageEvent) => void

	constructor(wsConn: WebSocket, request: Request) {
		this.wsConn = wsConn
		this.nickname = String(`SferaPeer_${Date.now()}`)
		this.ipAddress = SferaPeer.parseIpFromRequest(request)
		console.log(`A new peer has joined! Nickname: ${this.nickname}`)
		if(!this.ipAddress) {
			console.error(`Failed to parse IP address of peer: ${this.nickname}. This peer won't be able to send or receive files.`)
		}
		wsConn.send(`Your nickname: ${this.nickname}`)
		this.onMessage = (ev: MessageEvent) => console.log(`Peer ${this.nickname} has sent a message: ${ev.data}`)
		this.wsConn.onmessage = (ev: MessageEvent) => this.onMessage(ev)
	}

	private static parseIpFromRequest(request: Request) {
		let ipAddress = ""
		const xForwardedFor = request.headers['x-forwarded-for'] as string | undefined
		if (xForwardedFor) {
			ipAddress = xForwardedFor.split(/\s*,\s*/)[0];
		} else if(request.socket.remoteAddress) {
			ipAddress = request.socket.remoteAddress
		}
		// IPv4 and IPv6 use different values to refer to localhost
		if (ipAddress == '::1' || ipAddress == '::ffff:127.0.0.1') {
			ipAddress = '127.0.0.1';
		}
		return ipAddress
	}

	public send(message: SferaMessage) {
		this.wsConn.send(JSON.stringify(message))
	}


}