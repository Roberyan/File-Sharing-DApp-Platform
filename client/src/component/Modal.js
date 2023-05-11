import "./Modal.css"
import { useEffect } from "react";

const Modal = ({setModalOpen, contract}) => {

    const shareWith = async() =>{
        const address = document.querySelector(".address").value;
        await contract.grantAccess(address);
        setModalOpen(false);
    };

    const revoke = async() =>{
        const address = document.querySelector(".address").value;
        await contract.forbidAccess(address);
        setModalOpen(false);
    };

    const makeTableItem = (user, access)=>{
        let elementTr = document.createElement("tr");
        let elementTdAccount = document.createElement("td");
        let elementTdAccess = document.createElement("td");

        elementTdAccount.id = "click-to-choose";

        elementTdAccount.textContent = user;
        elementTdAccess.textContent = access;
        
        elementTdAccount.addEventListener('click', () => {
            document.querySelector(".address").value = user;
        });
        
        elementTr.appendChild(elementTdAccount);
        elementTr.appendChild(elementTdAccess);
        return elementTr;
    }

    useEffect(()=>{
        const accessList = async ()=>{
            const addressList = await contract.getSharedAccessInfo();
            // let select = document.querySelector("#selectNumber");
            let table = document.querySelector("#myTable");

            const accessInfo = addressList;
            
            table.innerHTML = "<tr><td>账户</td><td>访问权限</td></tr>";
            for(let j=0; j<accessInfo.length; j++){
                let info = accessInfo[j];
                console.log(info);
                table.appendChild(makeTableItem(info[0],info[1]));
            }

            // for(let i=0;i<accessInfo.length;i++){
            //     let opt = accessInfo[i];
            //     let element = document.createElement("option");
            //     element.textContent = opt;
            //     element.value = opt;
            //     select.appendChild(element);
            // }

        }
        contract && accessList();
    }, [contract]);


    return (
        <>
            <div className="modalBackground">
                <div className="modalContainer">
                    <div className="title">权限操作对象</div>
                    <div className="body">
                        <input type="text" placeholder="请输入目标账户地址" className="address"></input>
                    </div>

                    <div>
                        <table>
                            <thead>
                                <p>授权列表</p>
                            </thead>
                            <tbody id="myTable">

                            </tbody>
                        </table>
                    </div>

                    {/* <form id="myForm">
                        <select id="selectNumber">
                            <option className="address">已授权用户</option>
                        </select>
                    </form> */}

                    <div className="footer">
                        <button onClick={shareWith} id="grantBtn">授权</button>
                        <button onClick={revoke} id="forbidBtn">禁止</button>
                        <button onClick={()=>{setModalOpen(false)}} id="cancelBtn">返回</button>
                    </div>
                </div>
            </div>
        </>
    );
};
export default Modal;