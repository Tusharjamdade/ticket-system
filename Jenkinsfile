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
                echo "Running Container..."
                    withCredentials([file(credentialsId: 'ticket-system-env', variable: 'ENV_FILE')]) {
                    sh '''
                    cp $ENV_FILE .env
                    docker compose down || true
                    docker compose up -d --build
                    '''
            }
        }
    }
}
