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
                echo "---------- Running tests ----------"
                echo "Command: ${env.DOCKER_CMD}"

                script {
                    try {
                        sh '''
                            #!/bin/bash
                            set -e  # exit on error

                            mkdir -p /tmp/lh-workspace
                            cp -r . /tmp/lh-workspace/
                            chmod -R 777 /tmp/lh-workspace  # allow container to write

                            DATE=$(date +%F-%H-%M-%S)
                            OUTPUT_FOLDER="testResults/shop-test.js/${DATE}"

                            docker run --rm \
                                -v /tmp/lh-workspace:/lighthouse \
                                -w /lighthouse \
                                ibombit/lighthouse-puppeteer-chrome:latest \
                                node shop-test.js \
                                --outputFolder "${OUTPUT_FOLDER}" \
                                -n "${ITERATIONS}"

                            # Copy reports back (adjust path if script creates nested dirs)
                            mkdir -p testResults
                            cp -r /tmp/lh-workspace/testResults/* testResults/ || true
                            rm -rf /tmp/lh-workspace
                        '''
                    } catch (Exception err) {
                        echo "Test execution failed: ${err}"
                        currentBuild.result = 'UNSTABLE'  // or 'FAILURE'
                        error("Stopping due to test failure")
                    }
                }
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