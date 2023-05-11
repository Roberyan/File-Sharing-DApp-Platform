import {useEffect, useState} from "react"
import "./FilePage.css"
import axios from "axios";


const FilePage = ({setFileOpen, contract, fileURL})=>{
    const [link, setLink] = useState("");
    const [viewHistory, setViewHistory] = useState(-1);
    const [viewPeriod, setViewPeriod] = useState(-1);
    const [downloadHistory, setDownloadHistory] = useState(-1);
    const [downloadPeriod, setDownloadPeriod] = useState(-1);
    const [ratingHistory, setRatingHistory] = useState(-1);
    const [ratingPeriod, setRatingPeriod] = useState(-1);

    const transferNum = 1e6;
    const solToRating = (origin)=>{
        return origin/transferNum;
    }

    useEffect(()=>{

        const getFileInfo = async ()=>{

            // 从链上获取信息
            let info = await contract.getFileInfo(fileURL);
            setLink(fileURL);
            // 历史信息在链上存储
            setViewHistory(Number(info[0]._hex));
            setDownloadHistory(Number(info[2]._hex));
            setRatingHistory(solToRating(Number(info[4]._hex)));
    
            // 最近的信息在数据库存储
            // 从数据库获取信息
            console.log(fileURL.split("/")[4])
            const res = await axios.get("http://localhost:8081/getFileInfo/"+ fileURL.split("/")[4]);
            setViewPeriod(res.data[0].viewPeriod+1);
            setDownloadPeriod(res.data[0].downloadPeriod);
            setRatingPeriod(res.data[0].ratingPeriod);
        }
        
        getFileInfo();
    }, [])

    const goBack = async ()=>{
        let score = Math.floor(Math.random()*5) + 1; //模拟用户评价
        let rating = (ratingPeriod * (viewPeriod-1) + score)/viewPeriod;
        // console.log(score,rating);
        
        const updateData = {
            "viewPeriod":viewPeriod,
            "downloadPeriod": downloadPeriod,
            "ratingPeriod": rating
        }

        await axios.put("http://localhost:8081/updateFileInfo/"+ fileURL.split("/")[4], updateData);
        //await contract.setViewPeriod(link, viewPeriod+1);
        setFileOpen(false);
    }

    const downloadCtn = async ()=>{
        setDownloadPeriod(downloadPeriod+1);
        //await contract.setDownloadPeriod(link, downloadPeriod+1);
    }

    return(
        <>

            <div className="filePageContainer">
                
                <div className="img-details">
                    <h2>文件名</h2>
                    <img 
                        src={link}
                        alt="共享的文件"
                        className="info-img"
                    ></img>
                </div>

                <hr></hr>

                <div className="text-details">
                    <table className="fp-table">
                        <tbody>
                            <tr className="fp-tr">
                                <td className="fp-td info-title">哈希密码:</td>
                                <td className="fp-td info-value">{fileURL.split("/")[4]}</td>
                            </tr>
                            <tr className="fp-tr">
                                <td className="fp-td info-title">历史浏览量:</td>
                                <td className="fp-td info-value">{viewHistory}</td>
                                <td className="fp-td info-title">最近浏览量:</td>
                                <td className="fp-td info-value">{viewPeriod}</td>
                            </tr>
                            <tr className="fp-tr">
                                <td className="fp-td info-title">历史下载量:</td>
                                <td className="fp-td info-value">{downloadHistory}</td>
                                <td className="fp-td info-title">最近下载量:</td>
                                <td className="fp-td info-value">{downloadPeriod}</td>
                            </tr>
                            <tr className="fp-tr">
                                <td className="fp-td info-title">历史评分:</td>
                                <td className="fp-td info-value">{ratingHistory}</td>
                                <td className="fp-td info-title">最近评分:</td>
                                <td className="fp-td info-value">{ratingPeriod}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <hr></hr>

                <div className="fp-functionField">
                    <a href={link} target="_blank" rel="noopener  noreferrer" className="fp-download" onClick={downloadCtn}>下载</a>
                    <button className="fp-backBtn" onClick={goBack}>返回</button>
                </div>

            </div>

        </>
    );

};
export default FilePage;