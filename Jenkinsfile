@Library("shared") _
pipeline {
    agent { label "ec2-agent" }

    stages {
        stage("Hello"){
            steps{
                echo "Hi there this is Jenkinsfile test!"
                script{
                    hello()
                }
            }
        }
        stage('Code') {
            steps {
                script{
                    clone()
                }
            }
        }
        stage('Running Container') {
            steps {
                script{
                    runcode()
                }
            }
        }
    }
}
