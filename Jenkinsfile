pipeline {

    agent any

    parameters {
        choice(
            name: 'ITERATIONS',
            choices: ['1','3','5','10'],
            description: 'Number of Lighthouse loops'
        )
    }

    environment {
        SCRIPT = 'shop-test.js'
        RESULTS_ROOT = 'testResults'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/vkhalaim/lighthouse-home-task'
            }
        }

        stage('Run Lighthouse') {
            steps {
                sh """
                DATE=\$(date +%F-%H-%M-%S)
                RESULTS=${RESULTS_ROOT}/\$DATE

                mkdir -p \$RESULTS

                docker run --rm \
                  -v \$PWD:/lighthouse \
                  -w /lighthouse \
                  ibombit/lighthouse-puppeteer-chrome:latest \
                  node ${SCRIPT} \
                  --outputFolder \$RESULTS \
                  -n ${params.ITERATIONS}
                """
            }

            post {
                always {
                    archiveArtifacts artifacts: 'testResults/**', allowEmptyArchive: true
                }
            }
        }

    }
}
