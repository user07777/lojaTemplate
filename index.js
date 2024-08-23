const  bp = require('body-parser')
const express = require('express')
const app = express()
const mongo = require(__dirname+"/Mongo.js")
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { IpByTkn, getData } = require('./Mongo');

app.use(cookieParser());
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));


app.use(session({
    secret: '69d53e07abdece8b72e07f1f77ae961ca3540f3fa916e530189f07784ec64bcb', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // https -> true
}));

sendMail=_=>{ 

    //implementar logica 
    return false;
} 




app.get('/', (req, res) => res.sendFile(__dirname+"/public/index.html"))

app.get("/styles.css" , (req,res) => {
    res.sendFile(__dirname+"/public/styles.css")
})
app.get("/register",(req,res) => {
    res.sendFile(__dirname+"/public/register.html")
})

app.get("/products",(req,res) => {
    res.sendFile(__dirname+"/public/prod.html")
})
app.get("/register.css",(req,res) => {
    res.sendFile(__dirname+"/public/register.css")
})

app.post("/login",async (req,res) => {
    const  log =  await mongo.login(req.body.email,req.body.password,req.ip.toString());
    if(log.status==true){
        req.session.userId = log.id;
        res.cookie('tkn', log.id, { httpOnly: false }) // https false;
        res.send("<script>javascript:window.location.href='/'</script>");

    }else{
    res.send(log);
    }
})

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Erro ao fazer logout.");
        }
        res.clearCookie('tkn');
        res.redirect("/");
    });
});

app.post("/usrData", async (req,res) => {
    if (req.body.id != req.cookies.tkn){
        console.log(`${req.ip} Tentou acessar /usrData com id diferente!`);
        return

    }

    data = await mongo.usrData(req.body.id);
    if(data=="Null"  || data=="can't find user" || data=="Error"){
        res.send("null");
    }else{
        res.send(JSON.stringify(data));
    }
})

app.post("/update", async (req,res) => {
    if (req.session.userId != req.cookies.tkn){
        console.log(`${req.ip} Tentou acessar /update com id diferente!`);
        return
    }
    const ret =  await mongo.updtUsr(req.cookies.tkn,req.body.data);
    res.send(ret);
})
app.get(".*",(req,res) => {
    if(req.path == "/getCat") return
    if(req.path == "/") return
    if(req.path == "/products") return
    if(req.path == "/login") return

    if(req.path == "/register") return
    if(req.path.endsWith("css")) return

    if(req.cookies.tkn != ""){
        if(IpByTkn(req.cookies.tkn) != req.ip) {
            if(sendMail()) {
                res.clearCookie("tkn")
                // res.sendFile(confirm email logic)
                console.log("Não deveria...")
            }
        }
    }
})
app.post("/getData", async (req,res) => {
    if (JSON.stringify(req.body.data) == "{}") {
        data = await getData();
        res.send(JSON.stringify(data));
    }else{
        if(req.body.data["category"]) {
            data = await getData(req.body.data["category"],"category");
            res.send(JSON.stringify(data));
        }
    }
})
app.get("/profile", (req, res) => res.sendFile(__dirname+"/public/profile.html"))






app.listen(4444, () => {})