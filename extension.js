
const vscode = require('vscode');
const browserServer = require('browser-sync').create();
const { createProxyMiddleware } = require('http-proxy-middleware');
let myStatusBarItem;
let serverStatus = false;
let serverPort = 1;
/**
 * @author Roc Antonio
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "super-proxy" is now active!');

	const myCommandId = 'sample.startServer';

	context.subscriptions.push(vscode.commands.registerCommand(myCommandId, () => {
		let fileProxy = vscode.workspace.findFiles('**/config.proxy.js', '**/node_modules/**', 1);
		let pathStarter = vscode.workspace.findFiles('**/webapp/index.html', '**/node_modules/**', 1);

		pathStarter.then((start) => {
			if (!start.length)
				return vscode.window.showInformationMessage(`Didn't found a "/webapp/" directory`);
			fileProxy.then((prox) => {
				if (!prox.length)
					return vscode.window.showInformationMessage(`Didn't found a "config.proxy.js" file`);
				if (serverStatus) {
					stopServer();
				} else {
					startServer(start[0].fsPath.split("index.html")[0], require(prox[0].fsPath));
					vscode.window.showInformationMessage(`Super Server started at http://localhost:3000`);
				}
			});

		});


	}));
	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
	myStatusBarItem.command = myCommandId;
	context.subscriptions.push(myStatusBarItem);
	updateStatusBarItem();
}


function updateStatusBarItem() {
	if (serverStatus) {
		myStatusBarItem.text = `$(heart) :3000`;
	} else {
		myStatusBarItem.text = `$(smiley) Super Proxy`;
	}

	myStatusBarItem.show();
}

function startServer(sPath, oProxy) {

	let pathProxys = oProxy.HOSTS;
	let proxys = [];
	for (let i in pathProxys) {
		var rev = '^/' + pathProxys[i].key;
		var rel = {};
		rel[rev] = '/'
		proxys.push(createProxyMiddleware("/" + pathProxys[i].key + "/**", { target: "https://" + pathProxys[i].endPoint, changeOrigin: true, pathRewrite: rel }));
	}

	browserServer.init({
		files: [sPath+"**/*.js", sPath+"**/*.css"],
		server: sPath,
		middleware: proxys
	});
	serverStatus = true;
	updateStatusBarItem();
}

function stopServer() {
	browserServer.exit();
	serverStatus = false;
	updateStatusBarItem();
}


exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}



