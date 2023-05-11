import "./Cmd.css"
import { useEffect, useState } from "react";
import axios from "axios";

const Modal = ({setCmdOpen, contract}) => {
    const[timeCal, SetTimeCal] = useState()

    const files = [];
    const vHs = [];
    const dHs = [];
    const rHs = [];

    // 因为solidity智能合约不支持浮点数，
    // 因此采取扩倍存储的方式,
    // 通过前端进行翻译转化
    const transferNum = 1e6;
    const ratingToSol = (origin)=>{
        return Math.floor(origin*transferNum);
    }
    const solToRating = (origin)=>{
        return origin/transferNum;
    }

    // 获取单个文件信息
    const getFileValue = async (f)=>{
        let fTime = f.uploadTime;
        let fURL = f.fileURL;
        let fInfo = await contract.getFileInfo(fURL);
        const res = await axios.get("http://localhost:8081/getFileInfo/"+ fURL.split("/")[4]);
        let fSize = 100;

        let vH = (Number(fInfo[0]._hex));
        let vP = res.data[0].viewPeriod;//1//(Number(fInfo[1]._hex));
        let dH = (Number(fInfo[2]._hex));
        let dP = res.data[0].downloadPeriod;//1//(Number(fInfo[3]._hex));
        let rH = (Number(fInfo[4]._hex));
        let rP = res.data[0].ratingPeriod;//4//(Number(fInfo[5]._hex));

        files.push(fURL);
        vHs.push(vP);
        dHs.push(dP);
        rHs.push(ratingToSol(rP));

        // console.log(vH,vP,dH,dP,rH,rP);
        let w0 = timeDecay(fTime);
        let rstVaryH = 0.5*valueVary(rH,vH,dH);
        let rstVaryP = 0.5*valueVary(rP,vP,dP);

        return Math.log(fSize)*(0.5*w0*rstVaryH + (1-0.5*w0)*rstVaryP);
    }

    // 以天为单位
    const timeDecay = (T)=>{
        let t = T/(60*60*3600);
        let now = timeCal/(60*60*3600);
        return (now-t)>=7 ? 0.99**((now-t)/7) : 1;
    }

    // 动态价值
    const valueVary = (rating, view, download)=>{
        let quality = Math.tanh(0.7*(rating-3));
        let popularity = view/(view-download+1);
        return quality * popularity;
    }

    // 更新后台数据库及区块链上统计值
    const updateBackendDB = async()=>{
        // console.log(files, vHs,dHs,rHs);
        // 登记上链
        await contract.updateFileInfo(files, vHs, dHs, rHs);
        // 清空后台暂存
        await axios.get("http://localhost:8081/refreshFileInfo");
    }

    // 更新信誉值，并记录上链
    const updateReputation = async() => {
        SetTimeCal(Date.parse(new Date()) / 1000);
        let userAccounts = await contract.getAllPlayers();
        // console.log(userAccounts)

        let userFiles = new Array([]);
        let userScores = new Array(0);
        for(let i=0; i<userAccounts.length;i++){
            await contract.getFilesForUpdate(userAccounts[i]).then((res)=>{
                userFiles[i]=res;
                userScores[i]=0;
                // console.log("还在进行")
            })
        }
        // console.log(userFiles);
        // console.log(userScores);

        let addTotal = 0;
        let minusTotal = 0;

        // 计算共享行为
        // 循环每个用户
        for(let i=0; i<userAccounts.length;i++){
            // 遍历每个用户的文件
            for(let j=0; j<userFiles[i].length; j++){
                let x = 10; 
                await getFileValue(userFiles[i][j]).then((res)=>{
                    x = res;
                });
                userScores[i]+=x;
            }

            if(userScores[i]>=0){
                // console.log(userScores[i])
                addTotal += userScores[i];
            }else{
                minusTotal += userScores[i];
            }

            // console.log(userAccounts[i],userScores[i]);
        }

        // 分配奖励
        for(let i=0;i<userScores.length;i++){
            if(userScores[i]>=0){
                userScores[i] = userScores[i]/addTotal
            }else{
                userScores[i] = -1 * userScores[i]/minusTotal
            }
        }

        userScores.forEach((element,idx) => {
            userScores[idx] = Math.floor(transferNum*userScores[idx]);
        });
        // console.log(userScores);

        console.log(userAccounts,userScores);
        contract.updateReputation(userAccounts, userScores);
        updateBackendDB();
    }

    const makeTableItem = (userAddr, reputation)=>{
        let elementTr = document.createElement("tr");
        let elementTdAddr = document.createElement("td");
        let elementTdScore = document.createElement("td");

        elementTdAddr.id = "address";
        elementTdScore.id = "repScore";

        elementTdAddr.textContent = userAddr;
        elementTdScore.textContent = solToRating(reputation);
        
        elementTr.appendChild(elementTdAddr);
        elementTr.appendChild(elementTdScore);
        return elementTr;
    }

    useEffect(()=>{
        const rankList = async ()=>{
            const rankList = await contract.getAllPlayers();
            // console.log(rankList);
            let table = document.querySelector("#rank-table");
            
            table.innerHTML = "<tr><td>用户账户</td><td>信誉</td></tr>";
            for(let j=0; j<rankList.length; j++){
                let info = await contract.getUserReputation(rankList[j]);
                table.appendChild(makeTableItem(rankList[j], info));
            }
        }
        contract && rankList();
    }, [contract]);


    return (
        <>
            <div className="cmdBackground">
                <div className="cmdContainer">

                <div>
                    <table>
                        <thead id="rank-title">
                            <p>积分表</p>
                        </thead>
                        <tbody id="rank-table">

                        </tbody>
                    </table>
                </div>


                    <div className="footer">
                        <button onClick={updateReputation} id="updateBtn">更新平台信誉值</button>
                        <button onClick={()=>{setCmdOpen(false)}} id="cancelBtn">返回</button>
                    </div>
                </div>
            </div>
        </>
    );
};
export default Modal;