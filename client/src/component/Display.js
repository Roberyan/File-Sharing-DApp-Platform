import "./Display.css"
import {useState, useRef} from "react"
import FilePage from "./FilePage";
import {ethers} from "ethers";

const Display = ({account, contract}) => {
    const [myData, setMyData] = useState("");
    const [data, setData] = useState("");
    const [aimAccount, setAimAccount] = useState("");
    const filePageRef = useRef(null);

    const[fileOpen, setFileOpen] = useState(false);
    const[targetFile, setTargetFile] = useState("");
    const toFilePage = (url)=>{
        setTargetFile(url);
        setFileOpen(true);
        filePageRef.current.scrollIntoView({ behavior: "smooth" });
    }

    const[purchaseOpen, setPurchaseOpen] = useState(false);
    const purchaseAccess = async(aim)=>{
        // 定义调用参数
        const amount = ethers.utils.parseUnits('1', 'ether');
        // 调用pay函数
        await contract.purchaseAccessOf(aim, { value: amount }).then((transaction) => {
            console.log(`Transaction hash: ${transaction.hash}`);
        }).catch((error) => {
            console.log("有问题");
            console.error(error);
        });
        alert("权限购买成功！");
        setPurchaseOpen(false);
    }
    const purchasePage = ()=>{
        return(
            <div className="purchasePage">
                <p>是否愿意支付1 ether来获得访问权限？</p>
                <button className="button"  onClick={()=>{purchaseAccess(aimAccount)}}>确认</button>
                <button className="button" onClick={()=>{setPurchaseOpen(false)}}>取消</button>
            </div>
        );
    }


    const getData = async()=>{
        let dataArray;
        const aimingUserAddress = document.querySelector(".address").value;
        if(aimingUserAddress === ""){
            alert("请输入想要访问的用户地址");
            return;
        }
        setAimAccount(aimingUserAddress);
        try{
            // want to see others
            dataArray = await contract.getFilesFrom(aimingUserAddress);
            console.log("获取成功")
        }catch(error){
            alert(error);
            setPurchaseOpen(true);
            console.log("失败");
        }

        const isEmpty = (Object.keys(dataArray).length === 0); // check whether the account has uploaded data
        
        if(!isEmpty){
            console.log(dataArray)
            const files = dataArray.map((item,i)=>{
                return(
                    <div key={`a+${i}`}>
                        <img 
                            src={item[2]}
                            alt="共享的文件"
                            className="image-list"
                            onClick={()=>toFilePage(item[2])}
                        ></img>
                    </div>
                )
            });
            setData(files);
        }else{
            alert("对不起，该用户尚未在平台共享文件。");
        }
    };

    const getMyData = async()=>{
        let dataArray;
        try{
            dataArray = await contract.getFilesFrom(account);
            // console.log(dataArray);
        }catch(error){
            alert(error);
        }

        const isEmpty = (Object.keys(dataArray).length === 0); // check whether the account has uploaded data
        
        if(!isEmpty){
            const files = dataArray.map((item,i)=>{
                // console.log(`z+${i}`);
                return(
                    <div key={`z+${i}`}>
                        <img 
                            src={item[2]}
                            alt="共享的文件"
                            onClick={()=>toFilePage(item[2])}
                        ></img>
                    </div>
                )
            });
            setMyData(files);
        }else{
            const reminder = ()=>{
                return(
                    <h3>还没有上传过文件</h3>
                )
            }
            setMyData(reminder);
        }

    };


    
    return(
        <>  
            <div ref={filePageRef}>
                {
                    fileOpen && 
                    <FilePage setFileOpen={setFileOpen} contract={contract} fileURL={targetFile}></FilePage>
                }
            </div>

            <div id="myFiles">
                <p className="result-title">我共享的数据</p>
                <hr></hr>
                <button className="center button" onClick={getMyData}>
                    展示我上传的数据
                </button>
                <div className="image-list">{myData}</div>
            </div>

            <div id="searchUser">
                <p className="result-title">{aimAccount+" 的共享数据"}</p>
                <hr></hr>
                <input type="text" placeholder="请输入想要查看的用户地址" className="address"></input>
                <button className="center button" onClick={getData}>
                    查看数据
                </button>

                {
                    purchaseOpen &&  purchasePage()
                }

                <div className="image-list">{data}</div>
            </div>
        </>
    );
};
export default Display;