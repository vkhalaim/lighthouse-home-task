pipeline {

    agent any

    parameters {
        choice(
            name: 'ITERATIONS',
            choices: ['1','3','5','10'],
            description: 'Number of Lighthouse loops'
        )
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/vkhalaim/lighthouse-home-task'
            }
        }

        stage('Prepare results folder') {
            steps {
                sh '''
                mkdir -p $WORKSPACE/testResults
                '''
            }
        }

        stage('Run Lighthouse Test') {
            steps {
                sh """
                docker run --rm \
                -v ${WORKSPACE}/testResults:/lighthouse/testResults \
                -v ${WORKSPACE}:/lighthouse \
                -w /lighthouse \
                ibombit/lighthouse-puppeteer-chrome:latest \
                node shop-test.cjs --outputFolder /lighthouse/testResults -n ${params.ITERATIONS}
                """
            }
        }

        stage('Archive Lighthouse Results') {
            steps {
                archiveArtifacts artifacts: 'testResults/**', allowEmptyArchive: true
            }
        }
    }

    post {
        always {
            echo "Pipeline finished."
        }
    }
}