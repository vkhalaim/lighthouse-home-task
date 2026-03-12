pipeline {
    agent any

    parameters {
        choice(
            name: 'ITERATIONS',
            choices: ['1','3','5','10'],
            description: 'Number of Lighthouse runs'
        )
    }

    environment {
        REPORT_DIR = "testResults/${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/vkhalaim/lighthouse-home-task'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Lighthouse Test') {
            steps {
                sh """
                mkdir -p ${REPORT_DIR}

                node shop-test.cjs \
                --outputFolder ${REPORT_DIR} \
                -n ${params.ITERATIONS}
                """
            }
        }

        stage('Archive Results') {
            steps {
                archiveArtifacts artifacts: "${REPORT_DIR}/**", allowEmptyArchive: true
            }
        }

        stage('Publish HTML Report') {
            steps {
                publishHTML([
                    reportName: 'Lighthouse Reports',
                    reportDir: "${REPORT_DIR}",
                    reportFiles: '*.html',
                    keepAll: true,
                    alwaysLinkToLastBuild: true,
                    allowMissing: true
                ])
            }
        }
    }

    post {
        always {
            echo "Pipeline finished"
        }
    }
}