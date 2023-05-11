import './App.css';
import {useEffect, useState} from "react";
import {ethers} from "ethers";
import DataSharing from "./artifacts/contracts/DataSharing.sol/DataSharing.json"
import FileUpload from "./component/FileUpload";
import Display from "./component/Display";
import Modal from "./component/Modal";
import Cmd from "./component/Cmd";


function App() {
  const[account, setAccount] = useState("");
  const[contract, setContract] = useState(null);
  const[provider, setProvider] = useState(null);
  const[modalOpen, setModalOpen] = useState(false);
  const[reputation, setReputation] = useState(0);
  
  const transferNum = 1e6;
  const solToRating = (origin)=>{
    // console.log(origin);
    return origin/transferNum;
  }

  // 仅测试时用来设置平台虚拟用户值用户
  const[cmdOpen, setCmdOpen] = useState(false);

  useEffect(()=>{
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const wallet = async ()=>{
      if(provider){
        await provider.send("eth_requestAccounts",[]);

        // whenever change the network, refresh the page
        window.ethereum.on("chainChanged", ()=>{
          window.location.reload();
        });
        // whenever change the metamask account, refresh the page
        window.ethereum.on("accountsChanged", ()=>{
          window.location.reload();
        });

        const signer = provider.getSigner();
        const address = await signer.getAddress();
        // console.log(address);
        setAccount(address);
        
        const contractAddress = "需要根据合约的在区块链网络中的具体部署地址更改"; 
        const contract = new ethers.Contract(
          contractAddress,
          DataSharing.abi,
          signer
        );
        //console.log(contract);
        setContract(contract);
        setProvider(provider);
        const rep = await contract.getUserReputation(account);
        setReputation(solToRating(Number(rep)));
      }
      else{
        alert("Metamask is not installed!!!")
      }
    }
    provider && wallet();
  },[account])



  return (
    <>
      {!modalOpen && (
        <button className='share' onClick={()=>setModalOpen(true)}>权限</button>
      )}
      {
        modalOpen && (
          <Modal setModalOpen={setModalOpen} contract={contract}></Modal>
        )
      }

      {!cmdOpen && (
        <button onClick={()=>setCmdOpen(true)}>测试</button>
      )}
      {
        cmdOpen && (
          <Cmd setCmdOpen={setCmdOpen} contract={contract}></Cmd>
        )
      }

      <div className="App">
        <h1 style={{color:"white"}}>数据共享平台</h1>
        <div className="bg"></div>
        <div className="bg bg2"></div>
        <div className="bg bg3"></div>

        <p style={{color:"white"}}>
          区块链账户: {account} <br></br>
          平台信誉积分: {reputation}
        </p>

        <FileUpload account={account} contract={contract}></FileUpload>
        <Display account={account} contract={contract}></Display>
      </div>
    </>
  );
}

export default App;
