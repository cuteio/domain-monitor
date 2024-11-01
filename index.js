const core = require('@actions/core');
const github = require('@actions/github');


try {
    // 读取输入参数
    const domains = core.getInput('domains');
    const checkType = core.getInput('check-type');
    const warningDays = core.getInput('warning-days');
    const githubToken = core.getInput('github-token');
    const assignee = core.getInput('assignee');

    // 将域名字符串转换为数组
    const domainList = domains.split('\n').map(domain => domain.trim()).filter(Boolean);

    // 打印接收到的参数（用于测试）
    core.info('Received parameters:');
    core.info('Domains:', domainList);
    core.info('Check Type:', checkType);
    core.info('Warning Days:', warningDays);
    core.info('Assignee:', assignee);
    // 注意：不要打印 GitHub Token

    // 生成简单的报告
    const report = {
      timestamp: new Date().toISOString(),
      parameters: {
        domains: domainList,
        checkType,
        warningDays,
        assignee
      }
    };

    // 设置输出
    core.setOutput('report', JSON.stringify(report, null, 2));

} catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
}
