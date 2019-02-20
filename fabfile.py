#!/usr/bin/python
# ^_^ coding: utf-8 ^_^
from datetime import datetime
from fabric.api import *
from fabric.colors import *
import time
####多线程并发执行
env.parallel = True
#### 远程服务器信息
env.roledefs = {
'elms_web':['root@172.17.169.206:22']

}
env.password = 'kllk-1234'


###################elms_web_web部署##############################

@roles('elms_web')
def elms_web_deploy():
    ### 备份远程数据文件
    tag = datetime.now().strftime('%Y.%m.%d')
    remote_file = '/data/elms_web/static/dist'
    backup_file = '/data/code/backup/elms_web/dist%s'   % tag
    now_file = '/data/jenkins/workspace/elms_web/dist'
    ####遇到错误继续执行，不退出
    with settings(warn_only=True):
        ### 删除之前旧的备份
        run('rm -rf %s' % backup_file)
    ### 捕获异常，执行失败打印失败（红色），成功（绿色）
    try:
        get(remote_file,backup_file)
        with settings(warn_only=True):
            run('rm -rf %s' % remote_file)
        with lcd('/data/jenkins/workspace/elms_web/'):
            put('dist','/data/elms_web/static/')
            local('rm -rf dist')
        print green('successful')
    except SystemExit:
        print red('failure')

####################elms_web部署##############################


