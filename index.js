const core = require('@actions/core');
const github = require('@actions/github');


try {
    // 读取输入参数
    const inputs = {
      domains: core.getInput('domains', { required: true }),
      checkType: core.getInput('check-type', { required: true }),
      warningDays: core.getInput('warning-days', { required: true }),
      githubToken: core.getInput('github-token', { required: true }),
      assignee: core.getInput('assignee', { required: true })
    };

    core.info('Received inputs:', {
      domains: inputs.domains || 'NOT SET',
      checkType: inputs.checkType || 'NOT SET',
      warningDays: inputs.warningDays || 'NOT SET',
      assignee: inputs.assignee || 'NOT SET',
      // 不要打印 githubToken
    });

    // 将域名字符串转换为数组
    const domainList = inputs.domains.split('\n').map(domain => domain.trim()).filter(Boolean);

    // 打印接收到的参数（用于测试）
    core.info('Received parameters:');
    core.info('Domains:', domainList);
    core.info('Check Type:', checkType);
    core.info('Warning Days:', warningDays);
    core.info('Assignee:', assignee);
    // 注意：不要打印 GitHub Token

    // 设置输出
    core.setOutput('report', JSON.stringify({}));

} catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
}
