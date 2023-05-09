// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// solidity尚未完全支持浮点数存储，具体浮点数值需借助外部代码计算
contract DataSharing {
    // 权限访问块
    struct Access {
        address visitor; // 申请访问的用户地址
        bool access; // 访问权限
    }

    // 单个文件信息记录
    struct File {
        address uploader;
        uint uploadTime;
        string fileURL; // pinata存储凭据，可以通过Pinata得到文件大小、文件哈希密码等
    }

    // 文件各统计量
    mapping(string => uint) public viewHistory; // 访问量
    mapping(string => uint) public viewPeriod;
    mapping(string => uint) public downloadHistory; // 下载量
    mapping(string => uint) public downloadPeriod;
    mapping(string => uint) public ratingHistory; // 评分
    mapping(string => uint) public ratingPeriod;

    // 平台上各用户信息
    mapping(address => File[]) public userPossession; // 用户及其上传文件对应
    mapping(address => int128) public userReputation; // 由于solidity不支持浮点数运算，利用字符串进行存储

    mapping(address => Access[]) accessInfo; // 自己文件的访问权限
    mapping(address => mapping(address => bool)) accessManagement; // 权限管理
    mapping(address => mapping(address => bool)) hasSet; // 是否之前处理过
    mapping(address => bool) isUser; // 是否参与信誉计算的用户（共享过文件）
    address[] userAccounts; // 记录参与信誉计算的用户（共享过文件）

    // 上传文件
    function uploadFile(string calldata _fileURL) external {
        // 初次上传后加入信誉计算行列
        if (isUser[msg.sender] == false) {
            isUser[msg.sender] = true;
            userAccounts.push(msg.sender);
        }
        userPossession[msg.sender].push(
            File(msg.sender, block.timestamp, _fileURL)
        );
    }

    // 授权用户访问
    function grantAccess(address _visitor) external {
        accessManagement[msg.sender][_visitor] = true;
        if (hasSet[msg.sender][_visitor] == true) {
            for (uint i = 0; i < accessInfo[msg.sender].length; i++) {
                if (accessInfo[msg.sender][i].visitor == _visitor) {
                    accessInfo[msg.sender][i].access = true;
                    break;
                }
            }
        } else {
            accessInfo[msg.sender].push(Access(_visitor, true));
            hasSet[msg.sender][_visitor] = true;
        }
    }

    // 禁止用户访问
    function forbidAccess(address _visitor) external {
        accessManagement[msg.sender][_visitor] = false;
        for (uint i = 0; i < accessInfo[msg.sender].length; i++) {
            if (accessInfo[msg.sender][i].visitor == _visitor) {
                accessInfo[msg.sender][i].access = false;
                break;
            }
        }
    }

    // 查看某用户发布的文件
    function getFilesFrom(address _user) external view returns (File[] memory) {
        require(
            _user == msg.sender || accessManagement[_user][msg.sender],
            "Access Denied!"
        );
        return userPossession[_user];
    }

    function getFilesForUpdate(
        address _user
    ) external view returns (File[] memory) {
        return userPossession[_user];
    }

    function getUserReputation(address _user) external view returns (int128) {
        return userReputation[_user];
    }

    // 查看自己的授权记录
    function getSharedAccessInfo() public view returns (Access[] memory) {
        return accessInfo[msg.sender];
    }

    // 查看文件属性
    function getFileInfo(
        string memory _fileURL
    ) public view returns (uint, uint, uint, uint, uint, uint) {
        return (
            viewHistory[_fileURL],
            viewPeriod[_fileURL],
            downloadHistory[_fileURL],
            downloadPeriod[_fileURL],
            ratingHistory[_fileURL],
            ratingPeriod[_fileURL]
        );
    }

    // 获取信息
    function getAllPlayers() external view returns (address[] memory) {
        return userAccounts;
    }

    // 修改文件价值属性
    function setViewHistory(string memory _fileURL, uint views) external {
        viewHistory[_fileURL] = views;
    }

    function setViewPeriod(string memory _fileURL, uint views) external {
        viewPeriod[_fileURL] = views;
    }

    function setDownloadHistory(string memory _fileURL, uint times) external {
        downloadHistory[_fileURL] = times;
    }

    function setDownloadPeriod(string memory _fileURL, uint times) external {
        downloadPeriod[_fileURL] = times;
    }

    function setRatingHistory(string memory _fileURL, uint points) external {
        ratingHistory[_fileURL] = points;
    }

    function setRatingPeriod(string memory _fileURL, uint points) external {
        ratingPeriod[_fileURL] = points;
    }

    // 更新信誉积分
    function updateReputation(
        address[] calldata accounts,
        int128[] calldata newScores
    ) external {
        require(
            accounts.length == userAccounts.length,
            "All users need to be included!!!"
        );
        for (uint i = 0; i < accounts.length; i++) {
            userReputation[accounts[i]] += newScores[i];
        }
    }

    // 更新文件统计参数
    function updateFileInfo(
        string[] calldata files,
        uint[] calldata vHs,
        uint[] calldata dHs,
        uint[] calldata rHs
    ) external returns (string memory) {
        for (uint i = 0; i < files.length; i++) {
            viewHistory[files[i]] += vHs[i];
            downloadHistory[files[i]] += dHs[i];
            ratingHistory[files[i]] += rHs[i];
        }
        return "Files Info are updated!";
    }

    // 购买权限
    function purchaseAccessOf(address payable _seller) public payable {
        // 获取文件价格
        uint filePrice = 1 ether;

        require(msg.value >= filePrice, "Your offer can not pay the price!");
        _seller.transfer(filePrice);

        accessManagement[_seller][msg.sender] = true;
        accessInfo[_seller].push(Access(msg.sender, true));
        hasSet[_seller][msg.sender] = true;
    }
}

// 0x5FbDB2315678afecb367f032d93F642f64180aa3
