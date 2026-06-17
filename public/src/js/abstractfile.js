function getEncodingFallbacks(encoding){
	if(!encoding){
		return null
	}
	var normalized = encoding.toLowerCase()
	if(normalized === "sjis" || normalized === "shift_jis" || normalized === "shift-jis" || normalized === "cp932" || normalized === "windows-31j"){
		return ["utf-8", "shift_jis"]
	}
	return null
}
function mojibakeScore(text){
	var score = 0
	var common = /[�縺繧譁荳莨驥髫鬆鬱隕邱螟]/g
	var controls = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g
	var matches = text.match(common)
	if(matches){
		score += matches.length * 10
	}
	matches = text.match(controls)
	if(matches){
		score += matches.length * 20
	}
	return score
}
function decodeTextFallback(buffer, encodings){
	if(typeof TextDecoder === "undefined"){
		return null
	}
	var best = null
	for(var i = 0; i < encodings.length; i++){
		try{
			var text = new TextDecoder(encodings[i], {fatal: true}).decode(buffer)
			var score = mojibakeScore(text)
			if(!best || score < best.score){
				best = {text: text, score: score}
			}
		}catch(e){}
	}
	if(best){
		return best.text
	}
	return new TextDecoder(encodings[encodings.length - 1]).decode(buffer)
}
function readFile(file, arrayBuffer, encoding){
	var reader = new FileReader()
	var fallbacks = getEncodingFallbacks(encoding)
	var promise = pageEvents.load(reader).then(event => {
		if(fallbacks && !arrayBuffer){
			var text = decodeTextFallback(event.target.result, fallbacks)
			if(text !== null){
				return text
			}
		}
		return event.target.result
	})
	if(fallbacks || arrayBuffer){
		reader.readAsArrayBuffer(file)
	}else{
		reader.readAsText(file, encoding)
	}
	return promise
}
function filePermission(file){
	return file.queryPermission().then(response => {
		if(response === "granted"){
			return file
		}else{
			return file.requestPermission().then(response => {
				if(response === "granted"){
					return file
				}else{
					return Promise.reject(strings.accessNotGrantedError)
				}
			})
		}
	})
}
class RemoteFile{
	constructor(...args){
		this.init(...args)
	}
	init(url){
		this.url = url
		try{
			this.path = new URL(url).pathname
		}catch(e){
			this.path = url
		}
		if(this.path.startsWith("/")){
			this.path = this.path.slice(1)
		}
		this.name = this.path
		var index = this.name.lastIndexOf("/")
		if(index !== -1){
			this.name = this.name.slice(index + 1)
		}
	}
	arrayBuffer(){
		return loader.ajax(this.url, request => {
			request.responseType = "arraybuffer"
		})
	}
	read(encoding){
		if(encoding){
			return this.blob().then(blob => readFile(blob, false, encoding))
		}else{
			return loader.ajax(this.url)
		}
	}
	blob(){
		return this.arrayBuffer().then(response => new Blob([response]))
	}
}
class LocalFile{
	constructor(...args){
		this.init(...args)
	}
	init(file, path){
		this.file = file
		this.path = path || file.webkitRelativePath
		this.url = this.path
		this.name = file.name
	}
	arrayBuffer(){
		return readFile(this.file, true)
	}
	read(encoding){
		return readFile(this.file, false, encoding)
	}
	blob(){
		return Promise.resolve(this.file)
	}
}
class FilesystemFile{
	constructor(...args){
		this.init(...args)
	}
	init(file, path){
		this.file = file
		this.path = path
		this.url = this.path
		this.name = file.name
	}
	arrayBuffer(){
		return this.blob().then(blob => blob.arrayBuffer())
	}
	read(encoding){
		return this.blob().then(blob => readFile(blob, false, encoding))
	}
	blob(){
		return filePermission(this.file).then(file => file.getFile())
	}
}
class GdriveFile{
	constructor(...args){
		this.init(...args)
	}
	init(fileObj){
		this.path = fileObj.path
		this.name = fileObj.name
		this.id = fileObj.id
		this.url = gpicker.filesUrl + this.id + "?alt=media"
	}
	arrayBuffer(){
		return gpicker.downloadFile(this.id, true)
	}
	read(encoding){
		if(encoding){
			return this.blob().then(blob => readFile(blob, false, encoding))
		}else{
			return gpicker.downloadFile(this.id)
		}
	}
	blob(){
		return this.arrayBuffer().then(response => new Blob([response]))
	}
}
class CachedFile{
	constructor(...args){
		this.init(...args)
	}
	init(contents, oldFile){
		this.contents = contents
		this.oldFile = oldFile
		this.path = oldFile.path
		this.name = oldFile.name
		this.url = oldFile.url
	}
	arrayBuffer(){
		return Promise.resolve(this.contents)
	}
	read(encoding){
		return this.arrayBuffer()
	}
	blob(){
		return this.arrayBuffer().then(response => new Blob([response]))
	}
}
