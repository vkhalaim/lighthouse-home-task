pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

    parameters {
        choice(
            name: 'ITERATIONS',
            choices: ['3', '5', '10'],
            description: 'Number of Lighthouse loops'
        )
    }

    environment {
        // Define once, available everywhere
        SCRIPT          = 'shop-test.js'
        BASE_RESULTS    = "testResults/${SCRIPT}"
    }

    stages {
        stage('Pull Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/vkhalaim/lighthouse-home-task'
            }
        }

        stage('Preparation') {
            steps {
                script {
                    // These need script {} because of dynamic computation
                    def now = java.time.LocalDateTime.now()
                    def dateStr = String.format('%tF-%<tH-%<tM-%<tS', now)
                    env.RESULTS_DIR = "${env.BASE_RESULTS}/${dateStr}"
                    env.PWD = pwd()
                    
                    env.DOCKER_CMD = """
                        docker run --rm \
                            -v ${env.PWD}:/lighthouse \
                            -w /lighthouse \
                            ibombit/lighthouse-puppeteer-chrome:latest \
                            node ${SCRIPT} \
                            --outputFolder ${env.RESULTS_DIR} \
                            -n ${params.ITERATIONS}
                    """.stripIndent()
                }
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                echo "Running Lighthouse..."
                docker run --rm \
                    -v "$(pwd)":/workspace \
                    -w /workspace \
                    ibombit/lighthouse-puppeteer-chrome:latest \
                    ls -la
                '''
            }
        }
        
        stage('Publish Report') {
            steps {
                archiveArtifacts(
                    allowEmptyArchive: true,
                    artifacts: "${env.RESULTS_DIR}/**/*"
                )
                
                publishHTML(target: [
                    allowMissing         : true,
                    alwaysLinkToLastBuild: true,
                    keepAll              : true,
                    reportDir            : "${env.RESULTS_DIR}",
                    reportFiles          : 'index.html',
                    reportName           : 'Lighthouse HTML Report'
                ])
            }
        }
    }

    post {
        always {
            echo "Build finished with result: ${currentBuild.result}"
        }
        success {
            echo "Lighthouse tests completed successfully."
        }
        failure {
            echo "Pipeline failed."
        }
    }
}