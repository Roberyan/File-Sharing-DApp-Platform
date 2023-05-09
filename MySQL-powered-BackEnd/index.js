import express from "express"
import mysql from "mysql"
import cors from "cors"

const app = express();
const YOUR_DB_PASSWORD = ""

let mysqlServer = {
    host: "localhost",
    user: "root",
    password: YOUR_DB_PASSWORD,
    port: 3306,
    database:"demo" 
}
const db = mysql.createConnection(mysqlServer);

app.use(express.json());
app.use(cors());

app.get("/",(req,res)=>{
    res.json("这里是共享平台数据暂存后端!");
})

// 上传文件
app.post("/uploadFile", (req,res)=>{
    const q = "INSERT INTO sharedfilesinfo \
                (`fileName`) \
                VALUES \
                (?);";
    // const values = ["IPFS存储的哈希链接"];
    const values = [
        req.body.fileName
    ];
    db.query(q,values,(err,data)=>{
        if(err) {
            return res.json(err);
        }
        return res.json("成功上传文件");
    })
});

// 获取存储在非区块链上的统计数据，最近的浏览量、下载量等
app.get("/getFileInfo/:fURL", (req,res)=>{
    const fURL = req.params.fURL;
    const q = "SELECT * FROM sharedfilesinfo \
                WHERE `fileName`=?;";
    db.query(q, fURL, (err,data)=>{
        if(err) {
            console.log(err);
            return res.json(err);
        }
        return res.json(data);
    })
});

// 更新数据
app.put("/updateFileInfo/:fURL",(req,res)=>{
    const fURL = req.params.fURL;
    const q = "UPDATE sharedfilesinfo SET \
                `viewPeriod`=?,`downloadPeriod`=?,`ratingPeriod`=? \
                WHERE `fileName`=?;";
    const values = [
        req.body.viewPeriod,
        req.body.downloadPeriod,
        req.body.ratingPeriod
    ];

    db.query(q, [...values, fURL], (err,data)=>{
        if(err) {
            console.log(err);
            return res.json(err);
        }
        console.log("更新成功", values);
        return res.json(`成功更新${fURL}数据的统计指标`);
    });
});

// 因为数据已上传至区块链，原存储统计值全部清零
app.get("/refreshFileInfo",(req,res)=>{
    const q = "UPDATE sharedfilesinfo SET \
            `viewPeriod`=0,`downloadPeriod`=0,`ratingPeriod`=0;";

    db.query(q, (err,data)=>{
        if(err) {
            console.log(err);
            return res.json(err);
        }
        console.log("最近统计数值全部更新上链！");
        return res.json(`最近统计数值全部更新上链！`);
    });
});

// 测试网址
app.get("/test",(req,res)=>{
    const q = "SELECT * FROM sharedfilesinfo";
    db.query(q, (err,data)=>{
        if(err) {
            return res.json(err);
        }
        return res.json(data);
    })
})


app.listen(8081, ()=>{
    console.log("连接到后端数据库。");
})

