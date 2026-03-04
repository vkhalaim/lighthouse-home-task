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

        stage('Run Lighthouse') {
            steps {
                sh '''
                DATE=$(date +%F-%H-%M-%S)
                RESULTS=testResults/$DATE
                mkdir -p $RESULTS

                CONTAINER=$(docker create ibombit/lighthouse-puppeteer-chrome:latest)

                docker cp . $CONTAINER:/lighthouse

                docker start -a $CONTAINER \
                    node /lighthouse/shop-test.js \
                    --outputFolder /lighthouse/$RESULTS \
                    -n ${ITERATIONS}

                docker cp $CONTAINER:/lighthouse/testResults ./testResults

                docker rm $CONTAINER
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'testResults/**', allowEmptyArchive: true
        }
    }
}
