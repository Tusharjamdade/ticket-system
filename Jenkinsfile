@Library("shared") _
pipeline {
    agent { label "ec2-agent" }

    stages {
        stage("Hello"){
            steps{
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
