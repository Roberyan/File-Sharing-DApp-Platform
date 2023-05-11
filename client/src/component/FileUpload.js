import "./FileUpload.css"
import {useState} from "react";
import axios from "axios"; // bridge between client-side(react js) and server-side(panata)

const FileUpload = ({contract, account}) => {
    const [file, setFile] = useState(null); // Choose Selected File
    const [fileName, setFileName] = useState("待选择想要上传的文件"); // Get Selected File's Name
    // Handle files - to upload file on IPFS
    // Retrieve files

    const handleSubmit = async (e)=>{
        e.preventDefault();

        // if has selected file
        if(file){
            try{
                const formData = new FormData();
                formData.append("file", file); // sending our file in the form of FormData

                const resFile = await axios({
                    method: "post",
                    url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                    data: formData,
                    headers: {
                        pinata_api_key: `请自行注册Pinata账户获取`,
                        pinata_secret_api_key: `请自行注册Pinata账户获取`,
                        "Content-Type": "multipart/form-data",
                    },
                });

                // CID for the file you have uploaded on the IPFS network
                const FileHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`; // maybe change, if so watch the tutorial online
                // console.log(FileHash);
                // 记录在区块链上
                contract.uploadFile(FileHash);
                
                // 暂时记录在本地
                const newFile = {
                    "fileName": resFile.data.IpfsHash
                }
                await axios.post("http://localhost:8081/uploadFile", newFile);

                alert("文件上传成功!");
                setFileName("待选择想要上传的文件。");
                setFile(null);
            }catch(error){
                alert(error);
            }
        }
    }

    const retrieveFile = (e) =>{

        e.preventDefault();
        const data = e.target.files[0]; // [0] denotes upload one single file each time
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(data);
        reader.onloadend = ()=>{
            setFile(data);
        }
        // console.log(data.name);
        setFileName(data.name);
        
    };

    return (
        <div className="top">
            <form className="form" onSubmit={handleSubmit}>
                <label htmlFor="file-upload" className="choose">
                    选择共享文件
                </label>
                <input 
                    type="file" 
                    id="file-upload" 
                    name="data" 
                    onChange={retrieveFile}
                    disabled={!account} // no account, function not available!
                ></input>
                <span className="textArea">已选择: {fileName}</span>
                {/* no selected file, Upload function not available! */}
                <button type="submit" className="upload" disabled={!file}>
                    共享
                </button>
                
            </form>
        </div>
    );
};
export default FileUpload;